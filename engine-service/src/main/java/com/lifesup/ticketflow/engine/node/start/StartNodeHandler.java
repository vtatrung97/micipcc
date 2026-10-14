package com.lifesup.ticketflow.engine.node.start;

import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.flowable.bpmn.model.StartEvent;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/** START → none start event; StartVariableListener khởi tạo biến khi quy trình bắt đầu. */
@Component
public class StartNodeHandler extends NodeHandler<StartNodeConfig> {

    public StartNodeHandler() {
        super(StartNodeConfig.class, NodeType.START);
    }

    @Override
    public void declareVariables(StartNodeConfig config, NodeCheck check) {
        Set<String> names = new HashSet<>();
        List<StartNodeConfig.Variable> variables = config.getVariables();
        for (int i = 0; i < variables.size(); i++) {
            String field = path("config.variables", i, "name");
            String name = variables.get(i).getName();
            if (check.declare(field, name) && !names.add(name)) {
                check.error(ValidationCode.DUPLICATE_VARIABLE, field, "Biến bị khai báo trùng: " + name);
            }
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, StartNodeConfig config, ConversionContext context) {
        StartEvent event = init(new StartEvent(), node, context);
        event.getExecutionListeners().add(listener(ExecutionListener.EVENTNAME_START, StartVariableListener.BEAN));
        return ConvertedNode.single(event);
    }
}
