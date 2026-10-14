package com.lifesup.ticketflow.engine.node.gateway;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** JOIN → gateway cùng loại với gateway tách nhánh (parallel join chờ đủ mọi nhánh, ...). */
@Component
public class JoinNodeHandler extends NodeHandler<JoinNodeConfig> {

    public JoinNodeHandler() {
        super(JoinNodeConfig.class, NodeType.JOIN);
    }

    /** Chỉ kiểm JOIN trỏ tới gateway; việc hai bên trỏ vào nhau do GatewayNodeHandler kiểm. */
    @Override
    public void validate(JoinNodeConfig config, NodeCheck check) {
        String gatewayId = config.getGatewayNodeId();
        Optional<WorkflowNode> gateway = isBlank(gatewayId) ? Optional.empty() : check.findNode(gatewayId);
        if (gateway.isEmpty() || !gateway.get().getType().isGateway()) {
            check.error(ValidationCode.JOIN_GATEWAY_NOT_FOUND, "config.gatewayNodeId", "JOIN phải trỏ tới một gateway");
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, JoinNodeConfig config, ConversionContext context) {
        NodeType splitType = context.node(config.getGatewayNodeId()).getType();
        return ConvertedNode.single(init(GatewayNodeHandler.newGateway(splitType), node, context));
    }
}
