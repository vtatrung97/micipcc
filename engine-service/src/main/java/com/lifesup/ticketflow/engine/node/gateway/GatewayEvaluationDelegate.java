package com.lifesup.ticketflow.engine.node.gateway;

import com.lifesup.ticketflow.engine.workflow.NodeConfigReader;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import java.util.Set;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.BpmnError;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Task "đánh giá điều kiện" chèn trước gateway có nhánh error: đánh giá trước mọi nhánh, lỗi thì ném BPMN error
 * GATEWAY_ERROR để boundary event chuyển sang nhánh error; thành công thì để kết quả trong biến tạm cho gateway dùng.
 */
@Slf4j
@Component(GatewayEvaluationDelegate.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GatewayEvaluationDelegate implements JavaDelegate {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "gatewayEvaluationDelegate";

    NodeConfigReader configReader;
    ConditionEvaluator conditionEvaluator;

    @Override
    public void execute(DelegateExecution execution) {
        String gatewayId = configReader.readExtension(execution.getProcessDefinitionId(),
                execution.getCurrentActivityId(), GatewayNodeHandler.EXTENSION_GATEWAY_REF);
        Set<String> matched;
        try {
            matched = conditionEvaluator.evaluate(execution, gatewayId);
        } catch (ConditionOperators.EvaluationException exception) {
            log.warn("Gateway {} evaluation failed in process instance {}: {}",
                    gatewayId, execution.getProcessInstanceId(), exception.getMessage());
            throw new BpmnError(GatewayNodeHandler.ERROR_GATEWAY, exception.getMessage());
        }
        execution.setTransientVariable(WorkflowVariables.gatewayResult(gatewayId), matched);
    }
}
