package com.lifesup.ticketflow.engine.node.subprocess;

import com.lifesup.ticketflow.engine.workflow.NodeConfigReader;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/** Dữ liệu vào / ra của call activity, dùng trong tham số in / out (xem SubProcessNodeHandler). */
@Component(SubProcessIo.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubProcessIo {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "subProcessIo";

    NodeConfigReader configReader;

    /** Trên execution của quy trình cha: {subField: giá trị biến} theo inputs. */
    public Map<String, Object> input(DelegateExecution execution, String callActivityElementId) {
        SubProcessNodeConfig config = configReader.read(execution.getProcessDefinitionId(), callActivityElementId,
                SubProcessNodeConfig.class);
        Map<String, Object> input = new LinkedHashMap<>();
        for (SubProcessNodeConfig.Input mapping : config.getInputs()) {
            input.put(mapping.getSubField(), execution.getVariable(mapping.getVariable()));
        }
        return input;
    }

    /** Trên execution của quy trình con khi kết thúc: {@code __output[subField]}, không có thì null. */
    public Object output(DelegateExecution execution, String subField) {
        Object output = execution.getVariable(WorkflowVariables.OUTPUT);
        return output instanceof Map<?, ?> map ? map.get(subField) : null;
    }
}
