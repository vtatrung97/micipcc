package com.lifesup.ticketflow.engine.dto.response;

import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidationError;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Kết quả kiểm tra flowJson: valid = true khi không có lỗi. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ValidationResultResponse {
    boolean valid;
    List<WorkflowValidationError> errors;

    public static ValidationResultResponse ok() {
        return new ValidationResultResponse(true, List.of());
    }

    public static ValidationResultResponse invalid(List<WorkflowValidationError> errors) {
        return new ValidationResultResponse(false, errors);
    }
}
