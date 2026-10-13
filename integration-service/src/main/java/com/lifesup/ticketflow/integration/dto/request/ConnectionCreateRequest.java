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
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

/** Tạo kết nối tới một hệ thống. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionCreateRequest implements ConnectionDefinition {

    @Schema(type = "string", description = "external_system.id", example = "702305427898417152")
    @NotNull(message = "{validation.connection.systemId.required}")
    Long systemId;

    @Schema(description = "Mã kết nối, duy nhất trong hệ thống, không đổi sau khi tạo", example = "CRM_REST")
    @NotBlank(message = "{validation.connection.code.required}")
    @Size(max = 100, message = "{validation.connection.code.size}")
    @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "{validation.connection.code.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String code;

    @NotBlank(message = "{validation.connection.name.required}")
    @Size(max = 255, message = "{validation.connection.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Schema(description = "Mặc định REST")
    Protocol protocol;

    @Schema(description = "Endpoint gốc http/https, không có query", example = "https://crm.example.com/api")
    @NotBlank(message = "{validation.connection.baseUrl.required}")
    @Size(max = 1000, message = "{validation.connection.baseUrl.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String baseUrl;

    @Schema(description = "Mặc định NONE")
    AuthType authType;

    @Schema(description = "Cấu hình xác thực không bí mật, field cần tuỳ authType")
    @Valid
    AuthConfigData authConfig;

    @Schema(description = "Secret theo authType: API_KEY {apiKey}, BASIC {password}, BEARER {token}, OAUTH2_CLIENT_CREDENTIALS {clientSecret}. Chỉ ghi, không bao giờ trả ra", accessMode = Schema.AccessMode.WRITE_ONLY)
    @Valid
    @ToString.Exclude
    SecretData secret;

    @Schema(description = "Mặc định 5000")
    @Min(value = 100, message = "{validation.connection.timeoutMs.range}")
    @Max(value = 60000, message = "{validation.connection.timeoutMs.range}")
    Integer timeoutMs;

    @Schema(description = "Số lần gọi tối đa mỗi giây, bỏ trống = không giới hạn")
    @Min(value = 1, message = "{validation.connection.rateLimitPerSecond.min}")
    Integer rateLimitPerSecond;

    @Schema(description = "Cấu hình circuit breaker, bỏ trống = mặc định")
    @Valid
    CircuitBreakerConfigData circuitBreakerConfig;

    @Schema(description = "Mặc định ACTIVE")
    Status status;
}
