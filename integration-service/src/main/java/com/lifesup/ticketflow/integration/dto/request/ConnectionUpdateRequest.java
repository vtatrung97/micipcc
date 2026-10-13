package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.dto.data.AuthConfigData;
import com.lifesup.ticketflow.integration.dto.data.CircuitBreakerConfigData;
import com.lifesup.ticketflow.integration.dto.data.SecretData;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

/** Sửa kết nối (hệ thống và mã không đổi). Là cập nhật toàn bộ, trừ secret: không gửi secret thì giữ secret cũ. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionUpdateRequest implements ConnectionDefinition {

    @NotBlank(message = "{validation.connection.name.required}")
    @Size(max = 255, message = "{validation.connection.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @NotNull(message = "{validation.connection.protocol.required}")
    Protocol protocol;

    @Schema(description = "Endpoint gốc http/https, không có query", example = "https://crm.example.com/api")
    @NotBlank(message = "{validation.connection.baseUrl.required}")
    @Size(max = 1000, message = "{validation.connection.baseUrl.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String baseUrl;

    @NotNull(message = "{validation.connection.authType.required}")
    AuthType authType;

    @Schema(description = "Cấu hình xác thực không bí mật, field cần tuỳ authType")
    @Valid
    AuthConfigData authConfig;

    @Schema(description = "Không gửi = giữ secret cũ (bắt buộc gửi khi đổi authType). Gửi thì thay secret mới. Chỉ ghi, không bao giờ trả ra", accessMode = Schema.AccessMode.WRITE_ONLY)
    @Valid
    @ToString.Exclude
    SecretData secret;

    @NotNull(message = "{validation.connection.timeoutMs.required}")
    @Min(value = 100, message = "{validation.connection.timeoutMs.range}")
    @Max(value = 60000, message = "{validation.connection.timeoutMs.range}")
    Integer timeoutMs;

    @Schema(description = "Số lần gọi tối đa mỗi giây, bỏ trống = không giới hạn")
    @Min(value = 1, message = "{validation.connection.rateLimitPerSecond.min}")
    Integer rateLimitPerSecond;

    @Schema(description = "Cấu hình circuit breaker, bỏ trống = mặc định")
    @Valid
    CircuitBreakerConfigData circuitBreakerConfig;

    @Schema(description = "Bỏ trống = giữ nguyên. Không tự đổi trạng thái của API bên dưới")
    Status status;

    @Schema(description = "rowVersion lấy từ lần GET gần nhất; có truyền mà khác DB thì trả 409")
    Long rowVersion;
}
