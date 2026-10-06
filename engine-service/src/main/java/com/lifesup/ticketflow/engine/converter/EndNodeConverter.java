package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.EndEvent;
import org.flowable.bpmn.model.FlowElement;
import org.springframework.stereotype.Component;

/** Chuyển end node thành none end event. */
@Component
public final class EndNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.END; }
    @Override public FlowElement convert(WorkflowNode node) { return named(new EndEvent(), node); }
}
