package com.lifesup.ticketflow.integration.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Hệ thống thứ 3, dùng cho cả danh sách và chi tiết (không có cột lớn).
 * Thứ tự field khớp constructor dùng trong ExternalSystemRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExternalSystemResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    String name;
    Environment environment;
    String description;
    Status status;
    /** Số connection chưa xoá. */
    Long connectionCount;
    /** Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
