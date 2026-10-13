package com.lifesup.ticketflow.engine.runtime.support;

import org.flowable.bpmn.model.Activity;
import org.flowable.bpmn.model.ErrorEventDefinition;
import org.flowable.engine.delegate.DelegateExecution;

/** Tiện ích cho lỗi BPMN. */
public final class BpmnErrors {

    private BpmnErrors() {
    }

    /** Phần tử đang chạy có boundary event bắt lỗi {@code errorCode} không (tức node có nhánh error). */
    public static boolean hasErrorBoundary(DelegateExecution execution, String errorCode) {
        if (!(execution.getCurrentFlowElement() instanceof Activity activity)) {
            return false;
        }
        return activity.getBoundaryEvents().stream()
                .flatMap(boundary -> boundary.getEventDefinitions().stream())
                .anyMatch(definition -> definition instanceof ErrorEventDefinition error
                        && errorCode.equals(error.getErrorCode()));
    }
}
