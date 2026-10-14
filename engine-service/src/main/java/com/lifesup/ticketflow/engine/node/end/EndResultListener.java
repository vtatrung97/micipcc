package com.lifesup.ticketflow.engine.node.end;

import com.lifesup.ticketflow.engine.workflow.NodeConfigReader;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.ExecutionListener;
import org.springframework.stereotype.Component;

/**
 * Dựng kết quả khi tới END: {@code __output} = {formField: giá trị biến}. Luôn ghi (có thể rỗng) để quy trình cha
 * đọc được kể cả khi END không khai báo kết quả.
 */
@Component(EndResultListener.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EndResultListener implements ExecutionListener {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "endResultListener";

    NodeConfigReader configReader;

    @Override
    public void notify(DelegateExecution execution) {
        EndNodeConfig config = configReader.read(execution, EndNodeConfig.class);
        Map<String, Object> output = new LinkedHashMap<>();
        for (EndNodeConfig.Result result : config.getResults()) {
            output.put(result.getFormField(), execution.getVariable(result.getVariable()));
        }
        execution.setVariable(WorkflowVariables.OUTPUT, output);
    }
}
