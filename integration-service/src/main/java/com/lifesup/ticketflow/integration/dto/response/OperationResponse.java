package com.lifesup.ticketflow.integration.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.dto.data.RetryPolicyData;
import com.lifesup.ticketflow.integration.dto.request.OperationInputParam;
import com.lifesup.ticketflow.integration.dto.request.OperationOutputParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

/** Chi tiết API, kèm kết nối và hệ thống chứa nó. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    Integer versionNo;
    String name;
    String description;
    HttpMethod httpMethod;
    String path;
    Map<String, String> headers;
    Map<String, String> queryParams;
    /** Rỗng khi chưa khai báo. */
    List<OperationInputParam> inputParams;
    /** Rỗng khi chưa khai báo. */
    List<OperationOutputParam> outputParams;
    JsonNode requestSchema;
    JsonNode responseSchema;
    String requestMapping;
    String responseMapping;
    /** null = dùng timeout của kết nối. */
    Integer timeoutMs;
    RetryPolicyData retryPolicy;
    OperationStatus status;

    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long connectionId;
    String connectionCode;
    String connectionName;
    Status connectionStatus;

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

    @Schema(description = "Dùng được trong Flow: hệ thống, kết nối và API cùng ACTIVE")
    public boolean isUsable() {
        return systemStatus == Status.ACTIVE && connectionStatus == Status.ACTIVE && status == OperationStatus.ACTIVE;
    }
}
