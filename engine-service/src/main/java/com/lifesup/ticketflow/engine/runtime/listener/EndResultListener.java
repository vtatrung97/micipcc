package com.lifesup.ticketflow.engine.runtime.listener;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.dto.canvas.model.EndNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.EndResultMapping;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/**
 * Dựng kết quả của quy trình khi tới END: {@code __output} = {formField: giá trị biến} theo END.results.
 * Luôn ghi {@code __output} (có thể rỗng) để quy trình cha đọc được kể cả khi END không khai báo kết quả.
 */
@Component(BpmnExpressions.BEAN_END_RESULT_LISTENER)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EndResultListener implements ExecutionListener {
    NodeConfigReader configReader;

    @Override
    public void notify(DelegateExecution execution) {
        EndNodeConfig config = configReader.read(execution, EndNodeConfig.class);
        Map<String, Object> output = new LinkedHashMap<>();
        for (EndResultMapping result : config.getResults()) {
            output.put(result.getFormField(), execution.getVariable(result.getVariable()));
        }
        execution.setVariable(WorkflowVariables.OUTPUT, output);
    }
}
