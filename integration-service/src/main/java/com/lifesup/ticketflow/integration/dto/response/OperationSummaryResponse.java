package com.lifesup.ticketflow.integration.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;


/**
 * Một dòng trong danh sách API (operation), kèm hệ thống và kết nối chứa nó. Không trả schema/mapping (có thể lớn).
 * Thứ tự field khớp constructor dùng trong OperationRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationSummaryResponse {
    /** TSID, trả dạng chuỗi vì vượt giới hạn số nguyên an toàn của JavaScript. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    Integer versionNo;
    String name;
    String description;
    HttpMethod httpMethod;
    String path;
    OperationStatus status;

    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long connectionId;
    String connectionCode;
    String connectionName;

    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long systemId;
    String systemCode;
    String systemName;

    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
}
