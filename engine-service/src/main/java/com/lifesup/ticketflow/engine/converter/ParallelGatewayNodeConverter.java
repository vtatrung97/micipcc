package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.ParallelGateway;
import org.springframework.stereotype.Component;

/** Chuyển parallelGateway thành parallel gateway. */
@Component
public final class ParallelGatewayNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.GATEWAY_PARALLEL; }
    @Override public FlowElement convert(WorkflowNode node) { return named(new ParallelGateway(), node); }
}
