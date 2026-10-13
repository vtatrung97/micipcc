package com.lifesup.ticketflow.engine.runtime.delegate;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessInputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessNodeConfig;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/** Dữ liệu vào / ra của call activity, dùng trong tham số in / out (xem SubProcessNodeConverter). */
@Component(BpmnExpressions.BEAN_SUB_PROCESS_IO)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubProcessIo {
    NodeConfigReader configReader;

    /** Đánh giá trên execution của quy trình cha: {subField: giá trị biến} theo inputs. */
    public Map<String, Object> input(DelegateExecution execution, String callActivityElementId) {
        SubProcessNodeConfig config = configReader.read(execution.getProcessDefinitionId(), callActivityElementId,
                SubProcessNodeConfig.class);
        Map<String, Object> input = new LinkedHashMap<>();
        for (SubProcessInputMapping mapping : config.getInputs()) {
            input.put(mapping.getSubField(), execution.getVariable(mapping.getVariable()));
        }
        return input;
    }

    /** Đánh giá trên execution của quy trình con khi kết thúc: {@code __output[subField]}, không có thì null. */
    public Object output(DelegateExecution execution, String subField) {
        Object output = execution.getVariable(WorkflowVariables.OUTPUT);
        return output instanceof Map<?, ?> map ? map.get(subField) : null;
    }
}
