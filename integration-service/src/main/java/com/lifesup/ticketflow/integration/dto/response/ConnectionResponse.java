package com.lifesup.ticketflow.integration.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.dto.data.AuthConfigData;
import com.lifesup.ticketflow.integration.dto.data.CircuitBreakerConfigData;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Chi tiết connection. Không bao giờ trả secret, chỉ cho biết đã cấu hình hay chưa. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    String name;
    Protocol protocol;
    String baseUrl;
    AuthType authType;
    AuthConfigData authConfig;
    /** Đã lưu secret hay chưa. */
    boolean hasSecret;
    /** Lần cập nhật secret gần nhất, epoch millis. */
    Long secretUpdatedAt;
    Integer timeoutMs;
    Integer rateLimitPerSecond;
    CircuitBreakerConfigData circuitBreakerConfig;
    Status status;

    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long systemId;
    String systemCode;
    String systemName;
    Status systemStatus;

    /** Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
