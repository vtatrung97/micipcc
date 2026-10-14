package com.lifesup.ticketflow.engine.node.end;

import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import java.util.List;
import org.flowable.bpmn.model.EndEvent;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/** END → none end event; EndResultListener dựng kết quả {@code __output}. */
@Component
public class EndNodeHandler extends NodeHandler<EndNodeConfig> {

    public EndNodeHandler() {
        super(EndNodeConfig.class, NodeType.END);
    }

    /** END không có cổng ra. */
    @Override
    public boolean isValidHandle(WorkflowNode node, EndNodeConfig config, String handle) {
        return false;
    }

    @Override
    public void validate(EndNodeConfig config, NodeCheck check) {
        List<EndNodeConfig.Result> results = config.getResults();
        for (int i = 0; i < results.size(); i++) {
            check.requireDeclared(path("config.results", i, "variable"), results.get(i).getVariable());
            // formField là key trong __output, quy trình cha đọc qua biểu thức nên phải là ký tự an toàn
            check.requireFieldKey(path("config.results", i, "formField"), results.get(i).getFormField());
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, EndNodeConfig config, ConversionContext context) {
        EndEvent event = init(new EndEvent(), node, context);
        event.getExecutionListeners().add(listener(ExecutionListener.EVENTNAME_START, EndResultListener.BEAN));
        return ConvertedNode.single(event);
    }
}
