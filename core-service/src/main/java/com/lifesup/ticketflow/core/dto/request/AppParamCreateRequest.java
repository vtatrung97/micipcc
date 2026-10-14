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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppParamCreateRequest {

    @Schema(example = "TEMPLATE_CATEGORY")
    @NotBlank(message = "{validation.appParam.type.required}")
    @Size(max = 50, message = "{validation.appParam.type.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String type;

    @Schema(example = "Khiếu nại")
    @NotBlank(message = "{validation.appParam.name.required}")
    @Size(max = 255, message = "{validation.appParam.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Schema(description = "Không truyền thì sinh từ name: bỏ dấu, viết hoa, ký tự khác chữ/số thành _", example = "KHIEU_NAI")
    @Size(max = 100, message = "{validation.appParam.code.size}")
    @Pattern(regexp = "^[A-Za-z0-9_.-]*$", message = "{validation.appParam.code.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String code;
}
