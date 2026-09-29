package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.core.dto.response.ApiResponse;
import com.lifesup.ticketflow.core.dto.response.HealthCheckResponse;
import com.lifesup.ticketflow.core.exception.ErrorCode;
import com.lifesup.ticketflow.core.configuration.Translator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.TreeMap;

/**
 * Health check qua cổng API (đi qua Kong). Probe của Kubernetes dùng /actuator/health/liveness và /readiness
 * trên cổng management.
 */
@Tag(name = "Health")
@RestController
@RequestMapping("/api/v1/health-check")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HealthController {

    HealthEndpoint healthEndpoint;

    @Value("${spring.application.name}")
    @NonFinal
    String serviceName;

    @Operation(summary = "Kiểm tra trạng thái service và các thành phần (MariaDB, Redis...)")
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<ApiResponse<HealthCheckResponse>> healthCheck() {
        HealthComponent health = healthEndpoint.health();

        Map<String, String> components = new TreeMap<>();
        if (health instanceof CompositeHealth composite && composite.getComponents() != null) {
            composite.getComponents().forEach((name, component) -> components.put(name, component.getStatus().getCode()));
        }

        HealthCheckResponse result = HealthCheckResponse.builder()
                .service(serviceName)
                .status(health.getStatus().getCode())
                .components(components)
                .build();

        if (Status.UP.equals(health.getStatus())) {
            return ResponseEntity.ok(ApiResponse.success(result));
        }
        ErrorCode errorCode = ErrorCode.SERVICE_UNHEALTHY;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode, Translator.toLocale(errorCode.getMessage()), result));
    }
}
