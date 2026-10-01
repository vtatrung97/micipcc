package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Thông tin một phiên bản (không kèm flowJson).
 * Thứ tự field khớp constructor dùng trong TicketCallFlowVersionRepository.findSummariesByFlowId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowVersionSummaryResponse {
    Integer versionNo;
    TicketCallFlowVersionStatus status;
    String versionName;
    String versionDescription;
    /** Timestamp mili giây (epoch millis). */
    Long publishedAt;
    String publishedBy;
    /** Timestamp mili giây (epoch millis). */
    Long createdAt;
    String createdBy;
    /** Timestamp mili giây (epoch millis), lần lưu gần nhất của bản nháp. */
    Long updatedAt;
    String updatedBy;
}
