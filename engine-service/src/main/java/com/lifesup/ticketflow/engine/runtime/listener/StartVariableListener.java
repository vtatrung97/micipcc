package com.lifesup.ticketflow.engine.runtime.listener;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.dto.canvas.model.StartNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.StartVariable;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo biến của quy trình tại START theo START.variables, từ dữ liệu đầu vào {@code __input}:
 * <ul>
 *   <li>khởi tạo từ API engine: {@code __input} là biến tạm (không lưu DB);</li>
 *   <li>quy trình con: {@code __input} do call activity truyền vào, xoá sau khi dùng để không lưu trùng.</li>
 * </ul>
 * Biến không có giá trị vẫn được tạo (null) để điều kiện phía sau đọc được.
 */
@Component(BpmnExpressions.BEAN_START_VARIABLE_LISTENER)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StartVariableListener implements ExecutionListener {
    NodeConfigReader configReader;

    @Override
    public void notify(DelegateExecution execution) {
        StartNodeConfig config = configReader.read(execution, StartNodeConfig.class);
        Map<?, ?> input = takeInput(execution);
        for (StartVariable variable : config.getVariables()) {
            execution.setVariable(variable.getName(), resolve(variable, input));
        }
    }

    private static Map<?, ?> takeInput(DelegateExecution execution) {
        Object input = execution.getTransientVariable(WorkflowVariables.INPUT);
        if (input == null && execution.hasVariable(WorkflowVariables.INPUT)) {
            input = execution.getVariable(WorkflowVariables.INPUT);
            execution.removeVariable(WorkflowVariables.INPUT);
        }
        return input instanceof Map<?, ?> map ? map : Map.of();
    }

    /** Giá trị cố định → field của form → field của API; không có thì null. */
    private static Object resolve(StartVariable variable, Map<?, ?> input) {
        if (variable.getValue() != null) {
            return variable.getValue();
        }
        if (variable.getFormField() != null && input.containsKey(variable.getFormField())) {
            return input.get(variable.getFormField());
        }
        if (variable.getApiField() != null && input.containsKey(variable.getApiField())) {
            return input.get(variable.getApiField());
        }
        return null;
    }
}
