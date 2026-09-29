package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một dòng trong danh sách quy trình (không kèm flowJson).
 * Thứ tự field khớp constructor dùng trong TicketCallFlowRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowSummaryResponse {
    Long id;
    String code;
    String name;
    String description;
    TicketCallFlowStatus status;
    /** Timestamp mili giây (epoch millis). */
    Long createdAt;
    String createdBy;
    /** Timestamp mili giây (epoch millis). */
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
}
