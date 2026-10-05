package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.ExclusiveGateway;
import org.flowable.bpmn.model.FlowElement;
import org.springframework.stereotype.Component;

/** Chuyển condition/exclusiveGateway thành exclusive gateway. */
@Component
public final class ExclusiveGatewayNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.GATEWAY_EXCLUSIVE; }
    @Override public FlowElement convert(WorkflowNode node) { return named(new ExclusiveGateway(), node); }
}
