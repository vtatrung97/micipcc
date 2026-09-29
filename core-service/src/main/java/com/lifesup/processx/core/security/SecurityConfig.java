package com.lifesup.processx.core.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.processx.core.configuration.AppProperties;
import com.lifesup.processx.core.configuration.KeycloakProperties;
import com.lifesup.processx.core.configuration.RequestIdFilter;
import com.lifesup.processx.core.dto.response.ApiResponse;
import com.lifesup.processx.core.exception.ErrorCode;
import com.lifesup.processx.core.service.KeycloakService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.LocaleResolver;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình bảo mật của core-service. Có 2 cách xác thực:
 * <ul>
 *   <li>{@code X-API-Key: <key>} — các service nội bộ ProcessX gọi nhau (integration-service, report-service...)</li>
 *   <li>{@code Authorization: Bearer <access token>} — người dùng (webapps) và hệ thống ngoài, token do Keycloak cấp
 *       và được kiểm tra trực tiếp với Keycloak ở mỗi request</li>
 * </ul>
 *
 * <pre>
 * Luồng một request:
 *
 *  Request
 *    │
 *    ▼
 *  (0) app.security.enabled=false (tạm thời khi chưa có Keycloak) → bỏ qua (1)(2)(3), mọi API public
 *    │
 *    ▼
 *  (1) ApiKeyAuthenticationFilter ─ có header X-API-Key?
 *    │     ├─ key đúng  → SecurityContext = ApiKeyAuthenticationToken (ROLE_SERVICE)
 *    │     ├─ key sai   → trả 401 INVALID_API_KEY, DỪNG
 *    │     └─ không có  → đi tiếp
 *    ▼
 *  (2) KeycloakAuthenticationFilter ─ có "Authorization: Bearer ..." và chưa xác thực ở (1)?
 *    │     ├─ Keycloak xác nhận token active → SecurityContext = KeycloakAuthenticationToken (realm/client roles)
 *    │     ├─ token hết hạn/đã logout/user bị khoá → trả 401 UNAUTHENTICATED, DỪNG
 *    │     ├─ Keycloak lỗi hoặc không phản hồi     → trả 503 KEYCLOAK_UNAVAILABLE, DỪNG
 *    │     └─ không có token → đi tiếp
 *    ▼
 *  (3) Phân quyền (authorizeHttpRequests)
 *    │     ├─ endpoint thuộc PUBLIC_ENDPOINTS           → cho qua
 *    │     ├─ chưa xác thực                             → 401 UNAUTHENTICATED (authenticationEntryPoint)
 *    │     └─ đã xác thực nhưng thiếu quyền ở tầng filter → 403 ACCESS_DENIED (accessDeniedHandler)
 *    ▼
 *  (4) Controller — @PreAuthorize kiểm quyền chi tiết (lỗi 403 do GlobalExceptionHandler trả về)
 * </pre>
 *
 * Lỗi ở tầng filter chưa đi qua DispatcherServlet nên không tới được GlobalExceptionHandler;
 * {@link #writeError} tự ghi ApiResponse và tự xác định ngôn ngữ theo Accept-Language (mặc định vi).
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /** Các endpoint không yêu cầu xác thực. Thêm API public mới thì khai báo ở đây. */
    public static final RequestMatcher PUBLIC_ENDPOINTS = new OrRequestMatcher(Arrays.stream(new String[] {
                "/api/v1/auth/login",
                "/api/v1/auth/refresh",
                "/api/v1/health-check",
                "/actuator/health",
                "/actuator/health/**",
                "/actuator/info",
                "/actuator/prometheus",
                "/v3/api-docs",
                "/v3/api-docs/**",
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/error"
            })
            .map(AntPathRequestMatcher::new)
            .toArray(RequestMatcher[]::new));

    /** Cách filter ghi response lỗi, truyền vào 2 filter xác thực. */
    @FunctionalInterface
    interface ErrorWriter {
        void write(HttpServletRequest request, HttpServletResponse response, ErrorCode errorCode) throws IOException;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AppProperties appProperties,
            KeycloakProperties keycloakProperties,
            KeycloakService keycloakService,
            ObjectMapper objectMapper,
            LocaleResolver localeResolver)
            throws Exception {
        ErrorWriter errorWriter = (request, response, errorCode) ->
                writeError(request, response, errorCode, objectMapper, localeResolver);

        // Hai filter không khai báo @Component/@Bean để Spring Boot không tự đăng ký thêm vào servlet filter chain
        // (nếu có sẽ chạy 2 lần mỗi request)
        ApiKeyAuthenticationFilter apiKeyFilter = new ApiKeyAuthenticationFilter(
                appProperties.apiKey().headerName(), appProperties.apiKey().keys(), errorWriter);
        KeycloakAuthenticationFilter keycloakFilter =
                new KeycloakAuthenticationFilter(keycloakService, keycloakProperties.getRoleClients(), errorWriter);

        http.csrf(AbstractHttpConfigurer::disable) // API stateless dùng header, không dùng cookie session
                .cors(cors -> {}) // dùng bean corsConfigurationSource bên dưới
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable) // logout qua POST /api/v1/auth/logout
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // (0) app.security.enabled=false: TẠM THỜI khi chưa có Keycloak — bỏ qua (1)(2)(3), mọi API đều public
        if (!appProperties.security().enabled()) {
            log.warn("=== SECURITY DISABLED (app.security.enabled=false): all APIs are public, do not use in production ===");
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        http
                // (1) rồi (2): API key chạy trước, Keycloak chạy sau, cả hai trước AnonymousAuthenticationFilter
                .addFilterBefore(keycloakFilter, AnonymousAuthenticationFilter.class)
                .addFilterBefore(apiKeyFilter, KeycloakAuthenticationFilter.class)
                // (3)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) ->
                                errorWriter.write(request, response, ErrorCode.UNAUTHENTICATED))
                        .accessDeniedHandler((request, response, ex) ->
                                errorWriter.write(request, response, ErrorCode.ACCESS_DENIED)));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppProperties appProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        // CORS_ALLOWED_ORIGINS: nhiều domain cách nhau bởi dấu phẩy, VD "http://localhost:4200, http://192.168.10.18:4200".
        // Hỗ trợ pattern, VD "https://*.viettel.vn". Bỏ khoảng trắng thừa và phần tử rỗng.
        List<String> origins = appProperties.cors().allowedOrigins() == null
                ? List.of()
                : appProperties.cors().allowedOrigins().stream()
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .toList();
        log.info("CORS allowed origins: {}", origins);
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of(RequestIdFilter.HEADER, HttpHeaders.CONTENT_DISPOSITION));
        // Token giữ trong bộ nhớ trình duyệt (WS04 mục 5), không dùng cookie nên không cần credentials
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /** Ghi ApiResponse lỗi từ tầng filter, message theo ngôn ngữ của request. */
    private static void writeError(
            HttpServletRequest request,
            HttpServletResponse response,
            ErrorCode errorCode,
            ObjectMapper objectMapper,
            LocaleResolver localeResolver)
            throws IOException {
        if (response.isCommitted()) {
            return;
        }
        log.debug("{} {} -> {}", request.getMethod(), request.getRequestURI(), errorCode);
        ApiResponse<Void> body = ApiResponse.error(errorCode, localeResolver.resolveLocale(request));
        response.setStatus(errorCode.getStatusCode().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
