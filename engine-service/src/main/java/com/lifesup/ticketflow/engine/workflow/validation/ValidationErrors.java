package com.lifesup.ticketflow.engine.workflow.validation;

import java.util.ArrayList;
import java.util.List;

/** Gom lỗi của cả quy trình để trả về FE trong một lần, thay vì dừng ở lỗi đầu tiên. */
public final class ValidationErrors {
    private final List<WorkflowValidationError> errors = new ArrayList<>();

    public void add(ValidationCode code, String elementId, String field, String message) {
        errors.add(new WorkflowValidationError(code.name(), elementId, field, message));
    }

    public WorkflowValidationException toException() {
        return new WorkflowValidationException(errors);
    }

    public void throwIfAny() {
        if (!errors.isEmpty()) {
            throw toException();
        }
    }
}
