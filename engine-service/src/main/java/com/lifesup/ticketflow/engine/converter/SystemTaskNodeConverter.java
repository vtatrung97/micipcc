package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/** Chuyển SYSTEM_TASK thành service task dùng delegate cố định. */
@Component
public final class SystemTaskNodeConverter extends AbstractNodeConverter {
    public static final String FIXED_DELEGATE_EXPRESSION = "${systemTaskDelegate}";
    @Override public NodeType supports() { return NodeType.SYSTEM_TASK; }
    @Override public FlowElement convert(WorkflowNode node) {
        ServiceTask task = named(new ServiceTask(), node);
        task.setImplementationType("delegateExpression");
        task.setImplementation(FIXED_DELEGATE_EXPRESSION);
        BpmnFieldExtensionHelper.add(task, "systemId", node.getConfig().get("systemId"));
        BpmnFieldExtensionHelper.add(task, "apiId", node.getConfig().get("apiId"));
        BpmnFieldExtensionHelper.add(task, "timeout", node.getConfig().get("timeout"));
        BpmnFieldExtensionHelper.add(task, "retry", node.getConfig().get("retry"));
        BpmnFieldExtensionHelper.add(task, "inputMapping", node.getConfig().get("inputMapping"));
        BpmnFieldExtensionHelper.add(task, "outputFieldId", node.getConfig().get("outputFieldId"));
        return task;
    }
}
