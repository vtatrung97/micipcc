package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.StartEvent;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/** START → none start event; listener khởi tạo biến từ dữ liệu đầu vào theo START.variables. */
@Component
public final class StartNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.START;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        StartEvent event = init(new StartEvent(), node, context);
        event.getExecutionListeners().add(
                listener(ExecutionListener.EVENTNAME_START, BpmnExpressions.BEAN_START_VARIABLE_LISTENER));
        return ConvertedNode.single(event);
    }
}
