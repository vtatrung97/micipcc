package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.EndEvent;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/** END → none end event; listener dựng kết quả (__output) theo END.results. */
@Component
public final class EndNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.END;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        EndEvent event = init(new EndEvent(), node, context);
        event.getExecutionListeners().add(
                listener(ExecutionListener.EVENTNAME_START, BpmnExpressions.BEAN_END_RESULT_LISTENER));
        return ConvertedNode.single(event);
    }
}
