package com.lifesup.ticketflow.common.redis;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

/** Shared Redis connection and cache settings. */
@Validated
@ConfigurationProperties(prefix = "app.redis")
public record RedisProperties(
        boolean sentinel,
        String master,
        List<String> nodes,
        String host,
        int port,
        String username,
        String password,
        int database,
        boolean ssl,
        @NotNull Duration timeout,
        @NotBlank String keyPrefix,
        boolean cacheEnabled,
        @NotNull Duration cacheDefaultTtl) {
}
