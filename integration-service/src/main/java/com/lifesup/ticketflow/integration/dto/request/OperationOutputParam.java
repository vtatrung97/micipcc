package com.lifesup.ticketflow.integration.dto.request;

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
 * Giá trị đầu ra của API cho Flow: màn thiết kế Flow hiển thị ở cột "Trường dữ liệu API" để gán vào biến quy trình.
 * Là key của object do responseMapping dựng ra (mapping trống thì lấy field cùng tên ở cấp đầu của response body).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationOutputParam {

    @Schema(description = "Tên giá trị, duy nhất trong API", example = "result")
    @NotBlank(message = "{validation.param.name.required}")
    @Size(max = 100, message = "{validation.param.name.size}")
    @Pattern(regexp = "^[A-Za-z_][A-Za-z0-9_]*$", message = "{validation.param.name.pattern}")
    String name;

    @Schema(description = "Tên hiển thị", example = "Kết quả")
    @NotBlank(message = "{validation.param.label.required}")
    @Size(max = 255, message = "{validation.param.label.size}")
    String label;

    @Schema(example = "STRING")
    @NotNull(message = "{validation.param.type.required}")
    ParamType type;

    @Size(max = 1000, message = "{validation.param.description.size}")
    String description;
}
