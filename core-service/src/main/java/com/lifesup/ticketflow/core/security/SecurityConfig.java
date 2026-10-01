package com.lifesup.ticketflow.core.security;

import com.lifesup.ticketflow.common.web.RequestIdFilter;
import com.lifesup.ticketflow.core.configuration.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/** Service-specific CORS configuration. Authentication is auto-configured by common-auth. */
@Slf4j
@Configuration
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppProperties appProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
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
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
