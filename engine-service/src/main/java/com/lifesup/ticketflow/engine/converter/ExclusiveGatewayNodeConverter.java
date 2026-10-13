package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import org.flowable.bpmn.model.ExclusiveGateway;
import org.flowable.bpmn.model.Gateway;
import org.springframework.stereotype.Component;

/** GATEWAY_EXCLUSIVE → exclusive gateway, đi đúng một nhánh khớp đầu tiên. */
@Component
public final class ExclusiveGatewayNodeConverter extends AbstractGatewayNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.GATEWAY_EXCLUSIVE;
    }

    @Override
    protected Gateway newGateway() {
        return new ExclusiveGateway();
    }
}
