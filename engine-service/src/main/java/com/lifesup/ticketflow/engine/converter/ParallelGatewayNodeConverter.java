package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import org.flowable.bpmn.model.ParallelGateway;
import org.flowable.bpmn.model.Gateway;
import org.springframework.stereotype.Component;

/** GATEWAY_PARALLEL → parallel gateway, chạy song song mọi nhánh. */
@Component
public final class ParallelGatewayNodeConverter extends AbstractGatewayNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.GATEWAY_PARALLEL;
    }

    @Override
    protected Gateway newGateway() {
        return new ParallelGateway();
    }
}
