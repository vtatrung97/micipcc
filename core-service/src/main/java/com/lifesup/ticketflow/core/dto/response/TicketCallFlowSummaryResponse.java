package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
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
 * Một dòng trong danh sách quy trình (không kèm flowJson).
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
    Long id;
    String code;
    String name;
    /** Tiền tố mã hồ sơ, VD "PAKN". */
    String caseCodePrefix;
    String category;
    String description;
    TicketCallFlowStatus status;
    TriggerType triggerType;
    Integer slaValue;
    SlaUnit slaUnit;
    /** Số phiên bản đang hiệu lực, null = chưa publish lần nào. */
    Integer publishedVersionNo;
    /** Epoch millis. */
    Long publishedAt;
    /** Số phiên bản nháp, null = không có bản nháp. */
    Integer draftVersionNo;
    /** Lần lưu gần nhất của bản nháp, Epoch millis. */
    Long draftUpdatedAt;
    String draftUpdatedBy;
    /** Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
