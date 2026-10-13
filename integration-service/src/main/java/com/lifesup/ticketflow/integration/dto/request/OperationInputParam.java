package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import com.lifesup.ticketflow.integration.common.enums.ParamType;
import io.swagger.v3.oas.annotations.media.Schema;
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

/**
 * Tham số đầu vào của API: màn thiết kế Flow hiển thị ở cột "Yêu cầu API" để map với biến quy trình.
 * Dùng qua {name} trong path / headers / queryParams và $input.name trong requestMapping.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationInputParam {

    @Schema(description = "Tên tham số, duy nhất trong API", example = "ticketId")
    @NotBlank(message = "{validation.param.name.required}")
    @Size(max = 100, message = "{validation.param.name.size}")
    @Pattern(regexp = "^[A-Za-z_][A-Za-z0-9_]*$", message = "{validation.param.name.pattern}")
    String name;

    @Schema(description = "Tên hiển thị", example = "Mã ticket")
    @NotBlank(message = "{validation.param.label.required}")
    @Size(max = 255, message = "{validation.param.label.size}")
    String label;

    @Schema(example = "STRING")
    @NotNull(message = "{validation.param.type.required}")
    ParamType type;

    @Schema(description = "Bắt buộc truyền khi gọi API. Biến trên path phải là tham số bắt buộc")
    boolean required;

    @Schema(description = "Giá trị mặc định (đúng kiểu), chỉ cho tham số không bắt buộc", example = "IPCC")
    JsonNode defaultValue;

    @Size(max = 1000, message = "{validation.param.description.size}")
    String description;
}
