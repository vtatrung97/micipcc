package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.InclusiveGateway;
import org.springframework.stereotype.Component;

/** Chuyển inclusive gateway thành phần tử BPMN tương ứng. */
@Component
public final class InclusiveGatewayNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.GATEWAY_INCLUSIVE; }
    @Override public FlowElement convert(WorkflowNode node) { return named(new InclusiveGateway(), node); }
}
