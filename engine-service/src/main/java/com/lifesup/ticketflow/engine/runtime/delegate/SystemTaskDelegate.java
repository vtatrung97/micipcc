package com.lifesup.ticketflow.engine.runtime.delegate;

import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.client.IntegrationClient;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteRequest;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteResult;
import com.lifesup.ticketflow.engine.dto.canvas.model.ApiInputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.ApiOutputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.SystemTaskNodeConfig;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import com.lifesup.ticketflow.engine.runtime.support.BpmnErrors;
import com.lifesup.ticketflow.engine.runtime.support.ExecutionContexts;
import com.lifesup.ticketflow.engine.runtime.support.ValuePaths;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.common.engine.api.FlowableException;
import org.flowable.engine.delegate.BpmnError;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Chạy SYSTEM_TASK: dựng input theo inputs, gọi API qua integration-service, ghi kết quả vào biến theo outputs.
 *
 * <pre>
 *  thành công            → ghi outputs, đi nhánh success
 *  lỗi nghiệp vụ         → có nhánh error: BPMN error SYSTEM_TASK_ERROR → nhánh error
 *                          không có nhánh error: job lỗi (thử lại, hết lượt vào dead letter để xử lý tay)
 *  lỗi kỹ thuật          → IntegrationException, async executor thử lại
 * </pre>
 * Việc thử lại theo cấu hình node (retry / timeout) do integration-service thực hiện; engine chỉ gửi kèm.
 */
@Slf4j
@Component(BpmnExpressions.BEAN_SYSTEM_TASK_DELEGATE)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemTaskDelegate implements JavaDelegate {
    NodeConfigReader configReader;
    IntegrationClient integrationClient;

    @Override
    public void execute(DelegateExecution execution) {
        SystemTaskNodeConfig config = configReader.read(execution, SystemTaskNodeConfig.class);
        OperationExecuteRequest request = new OperationExecuteRequest(config.getSystemId(), buildInput(execution, config),
                config.getTimeout(), config.getRetry(), ExecutionContexts.idempotencyKey(execution),
                ExecutionContexts.of(execution));

        OperationExecuteResult result = integrationClient.executeOperation(config.getApiId(), request);
        if (!result.isSuccess()) {
            failBusiness(execution, config.getApiId(), result);
        }
        for (ApiOutputMapping output : config.getOutputs()) {
            execution.setVariable(output.getVariable(), ValuePaths.get(result.output(), output.getApiField()));
        }
    }

    private static Map<String, Object> buildInput(DelegateExecution execution, SystemTaskNodeConfig config) {
        Map<String, Object> input = new LinkedHashMap<>();
        for (ApiInputMapping mapping : config.getInputs()) {
            input.put(mapping.getApiParam(), execution.getVariable(mapping.getVariable()));
        }
        return input;
    }

    private static void failBusiness(DelegateExecution execution, String apiId, OperationExecuteResult result) {
        String message = "API " + apiId + " failed: " + result.errorCode() + " " + result.errorMessage();
        log.warn("{} (process instance {})", message, execution.getProcessInstanceId());
        if (BpmnErrors.hasErrorBoundary(execution, BpmnConstants.ERROR_SYSTEM_TASK)) {
            throw new BpmnError(BpmnConstants.ERROR_SYSTEM_TASK, message);
        }
        throw new FlowableException(message);
    }
}
