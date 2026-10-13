package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.common.enums.TriggerType;
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
 * Một dòng trong danh sách quy trình = một phiên bản (không kèm flowJson).
 * Thứ tự field khớp constructor dùng trong TemplateRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowSummaryResponse {
    /** TSID, trả dạng chuỗi vì vượt giới hạn số nguyên an toàn của JavaScript. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long templateId;
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417153")
    Long templateVersionId;
    String code;
    String name;
    String category;
    String description;
    TicketCallFlowStatus status;
    TriggerType triggerType;
    Integer slaValue;
    SlaUnit slaUnit;
    Integer versionNo;
    TicketCallFlowVersionStatus versionStatus;
    String versionName;
    /** Epoch millis, null = phiên bản chưa từng ban hành. */
    Long publishedAt;
    String publishedBy;
    /** Thời điểm tạo / cập nhật của phiên bản, Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
