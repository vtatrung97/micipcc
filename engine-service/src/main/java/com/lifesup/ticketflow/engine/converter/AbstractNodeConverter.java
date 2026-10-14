package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.bpmn.BpmnExtensions;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.Activity;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.ErrorEventDefinition;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.FlowableListener;
import org.flowable.bpmn.model.ImplementationType;
import org.flowable.bpmn.model.ServiceTask;

/** Các thao tác chung khi dựng phần tử BPMN cho một node. */
abstract class AbstractNodeConverter implements NodeConverter {

    /** Gán id, tên, mô tả và ghi cấu hình node vào tf:config để runtime đọc lại. */
    protected <T extends FlowElement> T init(T element, WorkflowNode node, ConversionContext context) {
        element.setId(context.bpmnId(node.getId()));
        element.setName(node.getName());
        if (node.getDescription() != null && !node.getDescription().isBlank()) {
            element.setDocumentation(node.getDescription());
        }
        BpmnExtensions.put(element, BpmnConstants.EXTENSION_CONFIG, context.toJson(node.getConfig()));
        return element;
    }

    /** Service task gọi bean qua delegateExpression. */
    protected static void delegateTo(ServiceTask task, String beanName) {
        task.setImplementationType(ImplementationType.IMPLEMENTATION_TYPE_DELEGATEEXPRESSION);
        task.setImplementation(BpmnExpressions.bean(beanName));
    }

    /** Listener (execution hoặc task) gọi bean qua delegateExpression tại sự kiện {@code event}. */
    protected static FlowableListener listener(String event, String beanName) {
        FlowableListener listener = new FlowableListener();
        listener.setEvent(event);
        listener.setImplementationType(ImplementationType.IMPLEMENTATION_TYPE_DELEGATEEXPRESSION);
        listener.setImplementation(BpmnExpressions.bean(beanName));
        return listener;
    }

    /** Boundary error (ngắt activity) bắt lỗi BPMN {@code errorCode} ném ra từ activity. */
    protected static BoundaryEvent errorBoundary(Activity activity, String errorCode, ConversionContext context) {
        BoundaryEvent boundary = new BoundaryEvent();
        boundary.setId(context.newId("boundary_error_", activity.getId()));
        boundary.setAttachedToRef(activity);
        boundary.setAttachedToRefId(activity.getId());
        boundary.setCancelActivity(true);
        ErrorEventDefinition error = new ErrorEventDefinition();
        error.setErrorCode(errorCode);
        boundary.addEventDefinition(error);
        activity.getBoundaryEvents().add(boundary);
        return boundary;
    }
}
