package com.lifesup.ticketflow.engine.workflow.validation;

import java.util.List;

/** Exception chứa toàn bộ lỗi của quy trình để trả về FE trong một lần. */
public final class WorkflowValidationException extends RuntimeException {
    private final transient List<WorkflowValidationError> errors;

    public WorkflowValidationException(List<WorkflowValidationError> errors) {
        super("Workflow validation failed with " + errors.size() + " error(s)");
        this.errors = List.copyOf(errors);
    }

    /** Danh sách lỗi bất biến. */
    public List<WorkflowValidationError> getErrors() {
        return errors;
    }
}
