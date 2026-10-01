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

import java.time.Instant;

/** Chi tiết một phiên bản, kèm JSON canvas để FE xem lại. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowVersionResponse {
    /** TSID, trả dạng chuỗi vì vượt giới hạn số nguyên an toàn của JavaScript. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long flowId;
    Integer versionNo;
    TicketCallFlowVersionStatus status;
    String versionName;
    String versionDescription;
    /** Chuỗi JSON canvas, đúng nguyên văn như FE đã gửi lên. */
    String flowJson;
    Instant publishedAt;
    String publishedBy;
    Instant createdAt;
    String createdBy;
    Instant updatedAt;
    String updatedBy;
}
