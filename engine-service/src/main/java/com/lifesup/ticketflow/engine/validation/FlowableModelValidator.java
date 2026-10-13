package com.lifesup.ticketflow.engine.validation;

import com.lifesup.ticketflow.engine.dto.workflow.WorkflowValidationError;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import java.util.List;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.validation.ProcessValidator;
import org.flowable.validation.ProcessValidatorFactory;
import org.springframework.stereotype.Component;

/** Lớp kiểm tra cuối: chạy bộ validator của Flowable trên BPMN đã sinh, chỉ chặn lỗi (bỏ qua cảnh báo). */
@Component
public final class FlowableModelValidator {
    private final ProcessValidator validator;

    public FlowableModelValidator() {
        this(new ProcessValidatorFactory().createDefaultProcessValidator());
    }

    public FlowableModelValidator(ProcessValidator validator) {
        this.validator = validator;
    }

    public void validate(BpmnModel model) {
        List<WorkflowValidationError> errors = validator.validate(model).stream()
                .filter(error -> !error.isWarning())
                .map(error -> new WorkflowValidationError(ValidationCode.FLOWABLE_MODEL_INVALID.name(),
                        error.getActivityId(), null,
                        error.getDefaultDescription() == null ? error.getProblem() : error.getDefaultDescription()))
                .toList();
        if (!errors.isEmpty()) {
            throw new WorkflowValidationException(errors);
        }
    }
}
