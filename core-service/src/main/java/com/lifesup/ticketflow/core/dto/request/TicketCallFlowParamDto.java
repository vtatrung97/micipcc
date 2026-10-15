package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một trường dữ liệu đầu vào / đầu ra của phiên bản quy trình; lưu JSON ở template_version.input_params / output_params. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowParamDto {

    @Schema(description = "Tên biến: chữ, số, dấu _", example = "so_thue_bao")
    @NotBlank(message = "{validation.ticketCallFlow.param.name.required}")
    @Size(max = 50, message = "{validation.ticketCallFlow.param.name.size}")
    @Pattern(regexp = "^[A-Za-z0-9_]*$", message = "{validation.ticketCallFlow.param.name.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;
}
