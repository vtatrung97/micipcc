package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;


/**
 * Thông tin một phiên bản (không kèm flowJson).
 * Thứ tự field khớp constructor dùng trong TemplateVersionRepository.findSummariesByTemplateId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowVersionSummaryResponse {
    /** templateVersionId, TSID dạng chuỗi. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417153")
    Long id;
    Integer versionNo;
    TicketCallFlowVersionStatus status;
    String versionName;
    String versionDescription;
    /** Epoch millis. */
    Long publishedAt;
    String publishedBy;
    /** Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Lần lưu gần nhất của phiên bản, Epoch millis. */
    Long updatedAt;
    String updatedBy;
}
