package com.lifesup.ticketflow.engine.node.start;

import com.lifesup.ticketflow.engine.workflow.handler.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.model.NodeType;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
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
        // Start event: id, tên, mô tả và tf:config (danh sách biến cần khởi tạo)
        StartEvent event = init(new StartEvent(), node, context);
        // Khi execution vào START: StartVariableListener tạo biến quy trình từ __input theo tf:config
        event.getExecutionListeners().add(listener(ExecutionListener.EVENTNAME_START, StartVariableListener.BEAN));
        // Một phần tử duy nhất: vừa nhận edge vào, vừa phát edge ra (next)
        return ConvertedNode.single(event);
    }
}
