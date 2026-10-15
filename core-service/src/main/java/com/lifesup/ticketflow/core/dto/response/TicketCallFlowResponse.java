package com.lifesup.ticketflow.core.dto.response;

import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowParamDto;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowTriggerDto;
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

import java.util.List;


/**
 * Chi tiết quy trình, kèm JSON canvas để FE vẽ lại.
 * flowJson là phiên bản vừa thao tác (lưu / ban hành / tạo); xem chi tiết quy trình thì là bản đang ban hành,
 * chưa có thì là phiên bản mới nhất.
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
    String category;
    String description;
    TicketCallFlowStatus status;
    /** null = quy trình tạo trước khi có cấu hình loại kích hoạt. */
    TicketCallFlowTriggerDto trigger;
    Integer slaValue;
    SlaUnit slaUnit;
    /** Chuỗi JSON canvas, đúng nguyên văn như FE đã gửi lên. */
    String flowJson;
    /** templateVersionId của flowJson ở trên, dùng cho lưu / ban hành / xoá / nhân bản phiên bản. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417153")
    Long flowJsonVersionId;
    /** Số phiên bản của flowJson ở trên. */
    Integer flowJsonVersionNo;
    /** Trạng thái phiên bản của flowJson ở trên. */
    TicketCallFlowVersionStatus flowJsonVersionStatus;
    /** Dữ liệu đầu vào của phiên bản flowJson ở trên, null = chưa khai báo. */
    List<TicketCallFlowParamDto> inputParams;
    /** Dữ liệu đầu ra của phiên bản flowJson ở trên, null = chưa khai báo. */
    List<TicketCallFlowParamDto> outputParams;
    /** Phiên bản của flowJson ở trên có node Quy trình con. */
    Boolean hasSubProcess;
    /** Bản đang ban hành, null = chưa có. */
    TicketCallFlowVersionSummaryResponse publishedVersion;
    /** Epoch millis. */
    Long createdAt;
    String createdBy;
    /** Epoch millis. */
    Long updatedAt;
    String updatedBy;
    /** Gửi lại khi lưu / ban hành để chống lưu đè. */
    Long rowVersion;
}
