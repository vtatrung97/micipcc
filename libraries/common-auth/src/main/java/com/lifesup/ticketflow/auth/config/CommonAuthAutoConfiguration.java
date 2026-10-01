package com.lifesup.ticketflow.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.auth.converter.KeycloakJwtAuthenticationConverter;
import com.lifesup.ticketflow.auth.service.KeycloakTokenService;
import com.lifesup.ticketflow.auth.service.KeycloakTokenServiceImpl;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.LocaleResolver;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.net.http.HttpClient;

/**
 * Auto-configures stateless JWT authentication for Ticket Flow services.
 * Keycloak access tokens and RPTs are both JWTs; permission enforcement is configured separately.
 */
@Slf4j
@AutoConfiguration
@EnableMethodSecurity
@ConditionalOnClass({HttpSecurity.class, JwtAuthenticationToken.class})
@EnableConfigurationProperties(CommonAuthProperties.class)
public class CommonAuthAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter(CommonAuthProperties properties) {
        return new KeycloakJwtAuthenticationConverter(properties.getRoleClients());
    }

    @Bean
    @ConditionalOnMissingBean(KeycloakTokenService.class)
    @ConditionalOnProperty(
            prefix = "ticket-flow.auth.token-client",
            name = "enabled",
            havingValue = "true")
    KeycloakTokenService keycloakTokenService(CommonAuthProperties properties, ObjectMapper objectMapper) {
        CommonAuthProperties.TokenClient tokenClient = properties.getTokenClient();
        requireText(tokenClient.getAuthServerUrl(), "ticket-flow.auth.token-client.auth-server-url");
        requireText(tokenClient.getRealm(), "ticket-flow.auth.token-client.realm");
        requireText(tokenClient.getClientId(), "ticket-flow.auth.token-client.client-id");
        requireText(tokenClient.getAudience(), "ticket-flow.auth.token-client.audience");

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(tokenClient.getConnectTimeout())
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(tokenClient.getReadTimeout());
        RestClient restClient = RestClient.builder()
                .baseUrl(stripTrailingSlash(tokenClient.getAuthServerUrl()))
                .requestFactory(requestFactory)
                .build();
        return new KeycloakTokenServiceImpl(tokenClient, restClient, objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    SecurityFilterChain commonAuthSecurityFilterChain(
            HttpSecurity http,
            CommonAuthProperties properties,
            KeycloakJwtAuthenticationConverter authenticationConverter,
            ObjectMapper objectMapper,
            LocaleResolver localeResolver) throws Exception {

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

        String[] publicPaths = properties.getPublicPaths().stream()
                .filter(org.springframework.util.StringUtils::hasText)
                .toArray(String[]::new);

        http.authorizeHttpRequests(authorize -> {
                    if (publicPaths.length > 0) {
                        authorize.requestMatchers(publicPaths).permitAll();
                    }
                    authorize.anyRequest().authenticated();
                })
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter))
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(request, response, ErrorCode.UNAUTHENTICATED, objectMapper, localeResolver)))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(request, response, ErrorCode.UNAUTHENTICATED, objectMapper, localeResolver))
                        .accessDeniedHandler((request, response, exception) ->
                                writeError(request, response, ErrorCode.ACCESS_DENIED, objectMapper, localeResolver)));
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

    private static void requireText(String value, String propertyName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(propertyName + " must be configured when the Keycloak token client is enabled");
        }
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
