package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.model.JoinNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.ExclusiveGateway;
import org.flowable.bpmn.model.Gateway;
import org.flowable.bpmn.model.InclusiveGateway;
import org.flowable.bpmn.model.ParallelGateway;
import org.springframework.stereotype.Component;

/** JOIN → gateway cùng loại với gateway tách nhánh tương ứng (parallel join chờ đủ mọi nhánh, ...). */
@Component
public final class JoinNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.JOIN;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        WorkflowNode split = context.node(node.config(JoinNodeConfig.class).getGatewayNodeId());
        Gateway gateway = switch (split.getType()) {
            case GATEWAY_EXCLUSIVE -> new ExclusiveGateway();
            case GATEWAY_PARALLEL -> new ParallelGateway();
            case GATEWAY_INCLUSIVE -> new InclusiveGateway();
            default -> throw new IllegalStateException("JOIN must reference a gateway: " + split.getId());
        };
        return ConvertedNode.single(init(gateway, node, context));
    }
}
