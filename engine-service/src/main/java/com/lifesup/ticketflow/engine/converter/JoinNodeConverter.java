package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.*;
import org.springframework.stereotype.Component;

/** Chuyển JOIN thành cùng loại gateway với gateway cha. */
@Component
public final class JoinNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.JOIN; }

    @Override
    public FlowElement convert(WorkflowNode node) {
        String gatewayType = String.valueOf(node.getConfig().get("gatewayType"));
        Gateway gateway = switch (NodeType.valueOf(gatewayType)) {
            case GATEWAY_EXCLUSIVE -> new ExclusiveGateway();
            case GATEWAY_PARALLEL -> new ParallelGateway();
            case GATEWAY_INCLUSIVE -> new InclusiveGateway();
            default -> throw new IllegalArgumentException("Unsupported JOIN gateway type: " + gatewayType);
        };
        return named(gateway, node);
    }
}
