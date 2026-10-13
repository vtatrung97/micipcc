package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/** NOTIFICATION → service task bất đồng bộ gọi NotificationDelegate. */
@Component
public final class NotificationNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.NOTIFICATION;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        ServiceTask task = init(new ServiceTask(), node, context);
        delegateTo(task, BpmnExpressions.BEAN_NOTIFICATION_DELEGATE);
        task.setAsynchronous(true);
        return ConvertedNode.single(task);
    }
}
