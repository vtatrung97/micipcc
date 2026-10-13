package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Kiểm tra một flowJson mà không deploy (core gọi khi lưu nháp / trước khi publish). */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ValidateDefinitionRequest {
    /** Mã template, dùng làm process key. */
    @NotBlank(message = "{validation.processKey.required}")
    @Pattern(regexp = "^[A-Za-z_][A-Za-z0-9_.-]*$", message = "{validation.processKey.pattern}")
    String processKey;

    String processName;

    @NotBlank(message = "{validation.flowJson.required}")
    String flowJson;
}
