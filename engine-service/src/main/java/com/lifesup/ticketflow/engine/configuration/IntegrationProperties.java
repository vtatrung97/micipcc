package com.lifesup.ticketflow.engine.configuration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Cấu hình gọi integration-service khi chạy SYSTEM_TASK / NOTIFICATION.
 *
 * @param mode           http = gọi thật; stub = không gọi, trả thành công (khi integration-service chưa có API)
 * @param baseUrl        địa chỉ integration-service
 * @param serviceName    tên service đích, dùng để lấy X-API-Key trong app.api-key.keys
 * @param connectTimeout timeout kết nối
 * @param readTimeout    timeout đọc; integration-service tự retry nên giá trị này phải đủ cho cả các lần thử lại
 */
@Validated
@ConfigurationProperties(prefix = "app.integration")
public record IntegrationProperties(
        @NotNull Mode mode,
        @NotBlank String baseUrl,
        @NotBlank String serviceName,
        @NotNull Duration connectTimeout,
        @NotNull Duration readTimeout) {

    public enum Mode {
        HTTP,
        STUB
    }
}
