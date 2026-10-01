package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

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
    Integer versionNo;
    TicketCallFlowVersionStatus status;
    String versionName;
    String versionDescription;
    /** UTC, ISO-8601. */
    Instant publishedAt;
    String publishedBy;
    /** UTC, ISO-8601. */
    Instant createdAt;
    String createdBy;
    /** Lần lưu gần nhất của bản nháp, UTC, ISO-8601. */
    Instant updatedAt;
    String updatedBy;
}
