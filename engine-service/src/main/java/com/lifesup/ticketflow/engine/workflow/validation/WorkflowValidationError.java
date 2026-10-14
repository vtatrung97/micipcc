package com.lifesup.ticketflow.engine.workflow.validation;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một lỗi validation có đủ vị trí để FE tô đúng phần tử: {@code elementId} là id node / edge,
 * {@code field} là đường dẫn trong cấu hình (VD config.cases[0].conditions[1].value).
 * FE nên hiển thị theo {@code code}; {@code message} là mô tả tiếng Việt để tham khảo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkflowValidationError {
    String code;
    String elementId;
    String field;
    String message;
}
