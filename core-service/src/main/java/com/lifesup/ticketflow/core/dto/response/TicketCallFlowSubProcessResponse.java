package com.lifesup.ticketflow.core.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.lifesup.ticketflow.core.common.enums.TriggerType;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowParamDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/** Quy trình chọn được làm quy trình con, kèm dữ liệu đầu vào / đầu ra của bản đang ban hành để map. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowSubProcessResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417152")
    Long id;
    String code;
    String name;
    TriggerType triggerType;
    /** templateVersionId của bản đang ban hành. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "702305427898417153")
    Long versionId;
    Integer versionNo;
    /** null = chưa khai báo. */
    List<TicketCallFlowParamDto> inputParams;
    /** null = chưa khai báo. */
    List<TicketCallFlowParamDto> outputParams;
}
