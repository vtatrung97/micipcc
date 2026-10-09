package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.configuration.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowCreateRequest {

    @Schema(description = "Mã quy trình, không đổi sau khi tạo", example = "KHIEU_NAI_DA_PHONG_BAN")
    @NotBlank(message = "{validation.ticketCallFlow.code.required}")
    @Size(max = 100, message = "{validation.ticketCallFlow.code.size}")
    @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "{validation.ticketCallFlow.code.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String code;

    @Schema(example = "Xử lý khiếu nại đa phòng ban")
    @NotBlank(message = "{validation.ticketCallFlow.name.required}")
    @Size(max = 255, message = "{validation.ticketCallFlow.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Schema(description = "Tiền tố mã hồ sơ: chữ in hoa không dấu và số, không đổi sau khi tạo", example = "PAKN")
    @NotBlank(message = "{validation.ticketCallFlow.caseCodePrefix.required}")
    @Size(max = 20, message = "{validation.ticketCallFlow.caseCodePrefix.size}")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "{validation.ticketCallFlow.caseCodePrefix.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String caseCodePrefix;

    @Schema(description = "Phân loại nhóm quy trình")
    @NotBlank(message = "{validation.ticketCallFlow.category.required}")
    @Size(max = 100, message = "{validation.ticketCallFlow.category.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String category;

    @Size(max = 1000, message = "{validation.ticketCallFlow.description.size}")
    String description;

    @NotNull(message = "{validation.ticketCallFlow.trigger.required}")
    @Valid
    TicketCallFlowTriggerDto trigger;

    @Schema(description = "Thời hạn xử lý (SLA)", example = "3")
    @NotNull(message = "{validation.ticketCallFlow.slaValue.required}")
    @Min(value = 1, message = "{validation.ticketCallFlow.slaValue.min}")
    Integer slaValue;

    @NotNull(message = "{validation.ticketCallFlow.slaUnit.required}")
    SlaUnit slaUnit;

    @Schema(description = "Mặc định DRAFT")
    TicketCallFlowStatus status;

    @Schema(description = "Chuỗi JSON của canvas, BE lưu và trả lại nguyên văn")
    @NotBlank(message = "{validation.ticketCallFlow.flowJson.required}")
    String flowJson;
}
