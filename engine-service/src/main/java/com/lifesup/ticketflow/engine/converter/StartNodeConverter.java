package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.StartEvent;
import org.springframework.stereotype.Component;

/** Chuyển trigger thành none start event. */
@Component
public final class StartNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.START; }
    @Override public FlowElement convert(WorkflowNode node) {
        StartEvent event = named(new StartEvent(), node);
        String triggerType = stringConfig(node, "triggerType");
        String triggerRefId = stringConfig(node, "triggerRefId");
        if (triggerType != null || triggerRefId != null)
            event.setDocumentation("triggerType=" + triggerType + ", triggerRefId=" + triggerRefId);
        return event;
    }

    private static String stringConfig(WorkflowNode node, String key) {
        Object value = node.getConfig().get(key);
        return value instanceof String text ? text : null;
    }
}
