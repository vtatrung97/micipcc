package com.lifesup.ticketflow.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.auth.aop.PermissionAspect;
import com.lifesup.ticketflow.auth.filter.PolicyEnforcerFilter;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import io.minio.MinioClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.LocaleResolver;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;


@Slf4j
@AutoConfiguration
@EnableMethodSecurity
@ConditionalOnClass({HttpSecurity.class, JwtAuthenticationToken.class})
@EnableConfigurationProperties(CommonAuthProperties.class)
@Import(MinioConfig.class)
public class CommonAuthAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    PermissionAspect permissionAspect() {
        return new PermissionAspect();
    }

    /** Same as IPCC: the Keycloak adapter config of each realm is loaded from MinIO. */
    @Bean
    @ConditionalOnMissingBean(PathBasedConfigResolver.class)
    @ConditionalOnProperty(prefix = "keycloak.config", name = "resolver", havingValue = "path", matchIfMissing = true)
    PathBasedConfigResolver pathBasedConfigResolver(
            MinioClient minioClient,
            @Value("${keycloak.config.auth-server-url:}") String authServerUrl,
            @Value("${spring.application.name}") String applicationName) {
        log.info("Keycloak config from MinIO, application: {}, auth-server-url override: {}", applicationName, authServerUrl);
        return new PathBasedConfigResolver(minioClient, applicationName, authServerUrl);
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    SecurityFilterChain commonAuthSecurityFilterChain(
            HttpSecurity http,
            CommonAuthProperties properties,
            ObjectMapper objectMapper,
            LocaleResolver localeResolver,
            ObjectProvider<PathBasedConfigResolver> configResolverProvider) throws Exception {

        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (!properties.isEnabled()) {
            log.warn("=== SECURITY DISABLED (ticket-flow.auth.enabled=false): all APIs are public ===");
            http.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
            return http.build();
        }

        PathBasedConfigResolver configResolver = configResolverProvider.getIfAvailable();
        if (configResolver == null) {
            throw new IllegalStateException("No Keycloak config resolver: set keycloak.config.resolver=path");
        }

        String[] publicPaths = properties.getPublicPaths().stream()
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
        RequestMatcher publicEndpoints = publicPaths.length == 0
                ? request -> false
                : new OrRequestMatcher(Arrays.stream(publicPaths)
                        .map(path -> (RequestMatcher) PathPatternRequestMatcher.withDefaults().matcher(path))
                        .toList());

        http.authorizeHttpRequests(authorize -> {
                    if (publicPaths.length > 0) {
                        authorize.requestMatchers(publicPaths).permitAll();
                    }
                    authorize.anyRequest().authenticated();
                })
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .authenticationManagerResolver(new KeycloakAuthenticationManagerResolver(configResolver))
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(request, response, ErrorCode.UNAUTHENTICATED, objectMapper, localeResolver)))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(request, response, ErrorCode.UNAUTHENTICATED, objectMapper, localeResolver))
                        .accessDeniedHandler((request, response, exception) ->
                                writeError(request, response, ErrorCode.ACCESS_DENIED, objectMapper, localeResolver)))
                .addFilterAfter(new PolicyEnforcerFilter(
                                configResolver,
                                (request, response, errorCode) ->
                                        writeError(request, response, errorCode, objectMapper, localeResolver),
                                publicEndpoints),
                        BearerTokenAuthenticationFilter.class);
        return http.build();
    }

    private static void writeError(
            HttpServletRequest request,
            HttpServletResponse response,
            ErrorCode errorCode,
            ObjectMapper objectMapper,
            LocaleResolver localeResolver) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        Locale locale = localeResolver.resolveLocale(request);
        response.setStatus(errorCode.getStatusCode().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), ApiResponse.error(errorCode, locale));
    }
}
