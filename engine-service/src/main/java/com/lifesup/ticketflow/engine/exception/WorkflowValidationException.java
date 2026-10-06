package com.lifesup.ticketflow.engine.exception;

import com.lifesup.ticketflow.engine.dto.workflow.WorkflowValidationError;
import java.util.List;

/** Exception chứa toàn bộ lỗi workflow để caller trả về FE trong một lần. */
public final class WorkflowValidationException extends RuntimeException {
    private final List<WorkflowValidationError> errors;

    public WorkflowValidationException(List<WorkflowValidationError> errors) {
        super("Workflow validation failed with " + errors.size() + " error(s)");
        this.errors = List.copyOf(errors);
    }

    /** Trả về danh sách lỗi validation bất biến. */
    public List<WorkflowValidationError> getErrors() { return errors; }
}
