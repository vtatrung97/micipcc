package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
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

import java.time.Instant;

/**
 * Chi tiết quy trình, kèm JSON canvas để FE vẽ lại.
 * flowJson là bản đang sửa: bản nháp nếu có, không thì bản đang hiệu lực.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowResponse {
    /** TSID, trả dạng chuỗi vì vượt giới hạn số nguyên an toàn của JavaScript. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    String name;
    /** Tiền tố mã hồ sơ, VD "PAKN". */
    String caseCodePrefix;
    String description;
    TicketCallFlowStatus status;
    /** Chuỗi JSON canvas, đúng nguyên văn như FE đã gửi lên. */
    String flowJson;
    /** Số phiên bản của flowJson ở trên. */
    Integer flowJsonVersionNo;
    /** Trạng thái phiên bản của flowJson ở trên (DRAFT hoặc PUBLISHED). */
    TicketCallFlowVersionStatus flowJsonVersionStatus;
    /** Bản đang hiệu lực, null = chưa publish lần nào. */
    TicketCallFlowVersionSummaryResponse publishedVersion;
    /** Bản nháp, null = không có bản nháp. */
    TicketCallFlowVersionSummaryResponse draftVersion;
    /** UTC, ISO-8601. */
    Instant createdAt;
    String createdBy;
    /** UTC, ISO-8601. */
    Instant updatedAt;
    String updatedBy;
    /** Gửi lại khi cập nhật / publish / huỷ bản nháp để chống lưu đè. */
    Long rowVersion;
}
