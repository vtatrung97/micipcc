package com.lifesup.ticketflow.core.configuration;

import com.lifesup.ticketflow.auth.filter.ApiKeyAuthenticationFilter.ApiKeyAuthenticationToken;
import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.Optional;

/** Tách khỏi class main để các test slice (@WebMvcTest) không phải dựng JPA. */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware", dateTimeProviderRef = "auditingDateTimeProvider")
public class JpaConfig {

    public static final String SYSTEM_AUDITOR = "system";

    /** Nguồn thời gian cho created_at/updated_at, Spring Data tự đổi sang epoch millis vì field kiểu Long. */
    @Bean
    public DateTimeProvider auditingDateTimeProvider() {
        return () -> Optional.of(Instant.now());
    }

    /**
     * Giá trị created_by/updated_by: Keycloak user id (sub) với người dùng,
     * {@code service:<clientId>} với service gọi bằng API key, {@code system} với job nền.
     */
    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (SecurityContextUtils.isJwtAuthenticationToken()) {
                return Optional.ofNullable(SecurityContextUtils.getUserId());
            }
            if (authentication instanceof ApiKeyAuthenticationToken apiKey) {
                return Optional.of("service:" + apiKey.getName());
            }
            return Optional.of(SYSTEM_AUDITOR);
        };
    }
}
