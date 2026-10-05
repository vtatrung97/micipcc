package com.lifesup.ticketflow.engine.dto.workflow;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một lỗi validation có đủ vị trí để FE highlight element tương ứng. */
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
