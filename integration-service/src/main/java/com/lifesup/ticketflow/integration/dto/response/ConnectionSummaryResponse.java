package com.lifesup.ticketflow.integration.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một dòng trong danh sách connection, kèm hệ thống chứa nó. Không trả cấu hình JSON và secret.
 * Thứ tự field khớp constructor dùng trong ConnectionRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionSummaryResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    String name;
    Protocol protocol;
    String baseUrl;
    AuthType authType;
    Integer timeoutMs;
    Status status;

    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long systemId;
    String systemCode;
    String systemName;
    Status systemStatus;

    /** Số API chưa xoá (mọi version). */
    Long operationCount;

    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
