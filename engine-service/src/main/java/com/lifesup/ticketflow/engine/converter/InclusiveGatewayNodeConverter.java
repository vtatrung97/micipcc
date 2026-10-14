package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import org.flowable.bpmn.model.InclusiveGateway;
import org.flowable.bpmn.model.Gateway;
import org.springframework.stereotype.Component;

/** GATEWAY_INCLUSIVE → inclusive gateway, đi mọi nhánh khớp. */
@Component
public final class InclusiveGatewayNodeConverter extends AbstractGatewayNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.GATEWAY_INCLUSIVE;
    }

    @Override
    protected Gateway newGateway() {
        return new InclusiveGateway();
    }
}
