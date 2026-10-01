package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

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
    /** Timestamp mili giây (epoch millis). */
    Long createdAt;
    String createdBy;
    /** Timestamp mili giây (epoch millis). */
    Long updatedAt;
    String updatedBy;
    /** Gửi lại khi cập nhật / publish / huỷ bản nháp để chống lưu đè. */
    Long rowVersion;
}
