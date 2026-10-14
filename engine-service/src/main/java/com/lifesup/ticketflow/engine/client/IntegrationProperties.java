package com.lifesup.ticketflow.engine.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Cấu hình gọi integration-service khi chạy SYSTEM_TASK / NOTIFICATION (app.integration.*). */
@Data
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE)
@ConfigurationProperties(prefix = "app.integration")
public class IntegrationProperties {
    /** http = gọi thật; stub = không gọi, trả thành công (khi integration-service chưa có API). */
    @NotNull
    Mode mode;
    /** Địa chỉ integration-service. */
    @NotBlank
    String baseUrl;
    /** Tên service đích, dùng để lấy X-API-Key trong app.api-key.keys. */
    @NotBlank
    String serviceName;
    @NotNull
    Duration connectTimeout;
    /** Timeout đọc; integration-service tự retry nên giá trị này phải đủ cho cả các lần thử lại. */
    @NotNull
    Duration readTimeout;

    public enum Mode {
        HTTP,
        STUB
    }
}
