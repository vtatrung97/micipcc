package com.lifesup.ticketflow.engine.runtime.condition;

import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
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
@Component(BpmnExpressions.BEAN_GATEWAY_EVALUATION_DELEGATE)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GatewayEvaluationDelegate implements JavaDelegate {
    NodeConfigReader configReader;
    ConditionEvaluator conditionEvaluator;

    @Override
    public void execute(DelegateExecution execution) {
        String gatewayId = configReader.readExtension(execution.getProcessDefinitionId(),
                execution.getCurrentActivityId(), BpmnConstants.EXTENSION_GATEWAY_REF);
        Set<String> matched;
        try {
            matched = conditionEvaluator.evaluate(execution, gatewayId);
        } catch (ConditionEvaluationException exception) {
            log.warn("Gateway {} evaluation failed in process instance {}: {}",
                    gatewayId, execution.getProcessInstanceId(), exception.getMessage());
            throw new BpmnError(BpmnConstants.ERROR_GATEWAY, exception.getMessage());
        }
        execution.setTransientVariable(WorkflowVariables.gatewayResult(gatewayId), matched);
    }
}
