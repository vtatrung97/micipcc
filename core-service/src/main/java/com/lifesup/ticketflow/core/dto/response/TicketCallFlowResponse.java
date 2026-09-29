package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Chi tiết quy trình, kèm JSON canvas để FE vẽ lại. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowResponse {
    Long id;
    String code;
    String name;
    String description;
    TicketCallFlowStatus status;
    /** Chuỗi JSON canvas, đúng nguyên văn như FE đã gửi lên. */
    String flowJson;
    /** Timestamp mili giây (epoch millis). */
    Long createdAt;
    String createdBy;
    /** Timestamp mili giây (epoch millis). */
    Long updatedAt;
    String updatedBy;
    /** Gửi lại khi cập nhật để chống lưu đè. */
    Long rowVersion;
}
