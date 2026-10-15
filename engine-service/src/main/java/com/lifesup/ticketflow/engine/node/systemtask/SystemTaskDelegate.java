package com.lifesup.ticketflow.engine.node.systemtask;

import com.lifesup.ticketflow.engine.client.IntegrationClient;
import com.lifesup.ticketflow.engine.client.dto.ExecutionContextInfo;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteRequest;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteResult;
import com.lifesup.ticketflow.engine.workflow.runtime.NodeConfigReader;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.bpmn.model.Activity;
import org.flowable.bpmn.model.ErrorEventDefinition;
import org.flowable.common.engine.api.FlowableException;
import org.flowable.engine.delegate.BpmnError;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Chạy SYSTEM_TASK: dựng input theo inputs, gọi API qua integration-service, ghi kết quả vào biến theo outputs.
 *
 * <pre>
 *  thành công     → ghi outputs, đi nhánh success
 *  lỗi nghiệp vụ  → có nhánh error: BPMN error SYSTEM_TASK_ERROR → nhánh error
 *                   không có nhánh error: job lỗi (thử lại, hết lượt vào dead letter để xử lý tay)
 *  lỗi kỹ thuật   → IntegrationException, async executor thử lại
 * </pre>
 * Việc thử lại theo cấu hình node (retry / timeout) do integration-service thực hiện; engine chỉ gửi kèm.
 */
@Slf4j
@Component(SystemTaskDelegate.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemTaskDelegate implements JavaDelegate {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "systemTaskDelegate";

    NodeConfigReader configReader;
    IntegrationClient integrationClient;

    @Override
    public void execute(DelegateExecution execution) {
        SystemTaskNodeConfig config = configReader.read(execution, SystemTaskNodeConfig.class);
        OperationExecuteRequest request = new OperationExecuteRequest(config.getSystemId(), buildInput(execution, config),
                config.getTimeout(), config.getRetry(), ExecutionContextInfo.idempotencyKey(execution),
                ExecutionContextInfo.of(execution));

        OperationExecuteResult result = integrationClient.executeOperation(config.getApiId(), request);
        if (!result.isSuccess()) {
            failBusiness(execution, config.getApiId(), result);
        }
        for (SystemTaskNodeConfig.Output output : config.getOutputs()) {
            execution.setVariable(output.getVariable(), valueAt(result.getOutput(), output.getApiField()));
        }
    }

    private static Map<String, Object> buildInput(DelegateExecution execution, SystemTaskNodeConfig config) {
        Map<String, Object> input = new LinkedHashMap<>();
        for (SystemTaskNodeConfig.Input mapping : config.getInputs()) {
            input.put(mapping.getApiParam(), execution.getVariable(mapping.getVariable()));
        }
        return input;
    }

    private static void failBusiness(DelegateExecution execution, String apiId, OperationExecuteResult result) {
        String message = "API " + apiId + " failed: " + result.getErrorCode() + " " + result.getErrorMessage();
        log.warn("{} (process instance {})", message, execution.getProcessInstanceId());
        if (hasErrorBranch(execution)) {
            throw new BpmnError(SystemTaskNodeHandler.ERROR_SYSTEM_TASK, message);
        }
        throw new FlowableException(message);
    }

    /** Task đang chạy có boundary bắt SYSTEM_TASK_ERROR không (tức node có nhánh error). */
    private static boolean hasErrorBranch(DelegateExecution execution) {
        if (!(execution.getCurrentFlowElement() instanceof Activity activity)) {
            return false;
        }
        return activity.getBoundaryEvents().stream()
                .flatMap(boundary -> boundary.getEventDefinitions().stream())
                .anyMatch(definition -> definition instanceof ErrorEventDefinition error
                        && SystemTaskNodeHandler.ERROR_SYSTEM_TASK.equals(error.getErrorCode()));
    }

    /** Giá trị theo đường dẫn "a.b.c" trong map lồng nhau; key có sẵn dấu chấm được ưu tiên khớp nguyên văn. */
    static Object valueAt(Map<String, ?> source, String path) {
        if (source == null || path == null) {
            return null;
        }
        if (source.containsKey(path)) {
            return source.get(path);
        }
        Object current = source;
        for (String part : path.split("\\.")) {
            if (!(current instanceof Map<?, ?> map)) {
                return null;
            }
            current = map.get(part);
        }
        return current;
    }
}
