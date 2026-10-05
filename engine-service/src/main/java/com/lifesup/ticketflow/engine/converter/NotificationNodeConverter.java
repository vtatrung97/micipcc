package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/** Chuyển notification thành service task dùng delegate cố định. */
@Component
public final class NotificationNodeConverter extends AbstractNodeConverter {
    public static final String FIXED_DELEGATE_EXPRESSION = "${notificationTaskDelegate}";

    @Override public NodeType supports() { return NodeType.NOTIFICATION; }

    @Override
    public FlowElement convert(WorkflowNode node) {
        ServiceTask task = named(new ServiceTask(), node);
        task.setImplementationType("delegateExpression");
        task.setImplementation(FIXED_DELEGATE_EXPRESSION);
        BpmnFieldExtensionHelper.add(task, "content", node.getConfig().get("content"));
        BpmnFieldExtensionHelper.add(task, "recipientIds", node.getConfig().get("recipientIds"));
        BpmnFieldExtensionHelper.add(task, "channels", node.getConfig().get("channels"));
        return task;
    }
}
