package com.lifesup.ticketflow.engine.runtime.condition;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.common.enums.LogicOperator;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCase;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCondition;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayNodeConfig;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.function.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/**
 * Đánh giá điều kiện rẽ nhánh của gateway theo cấu hình tf:config của gateway.
 * Được gọi trong biểu thức điều kiện của từng sequence flow (xem BpmnExpressions.caseCondition).
 */
@Component(BpmnExpressions.BEAN_CONDITION_EVALUATOR)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConditionEvaluator {
    NodeConfigReader configReader;

    /**
     * Nhánh {@code caseId} của gateway có khớp không. Nếu task "đánh giá điều kiện" đã chạy trước gateway thì dùng
     * kết quả của nó (biến tạm), không thì đánh giá trực tiếp.
     */
    public boolean matches(DelegateExecution execution, String gatewayElementId, String caseId) {
        Object evaluated = execution.getTransientVariable(WorkflowVariables.gatewayResult(gatewayElementId));
        if (evaluated instanceof Set<?> matchedCases) {
            return matchedCases.contains(caseId);
        }
        return evaluate(execution, gatewayElementId).contains(caseId);
    }

    /** Id các nhánh khớp, theo thứ tự cấu hình. Không đánh giá được thì ném ConditionEvaluationException. */
    public Set<String> evaluate(DelegateExecution execution, String gatewayElementId) {
        GatewayNodeConfig config = configReader.read(execution.getProcessDefinitionId(), gatewayElementId,
                GatewayNodeConfig.class);
        Set<String> matched = new LinkedHashSet<>();
        for (GatewayCase gatewayCase : config.getCases()) {
            if (matchesCase(execution, gatewayCase)) {
                matched.add(gatewayCase.getId());
            }
        }
        return matched;
    }

    private static boolean matchesCase(DelegateExecution execution, GatewayCase gatewayCase) {
        Predicate<GatewayCondition> test = condition -> ConditionOperators.test(
                condition.getOperator(), execution.getVariable(condition.getField()), condition.getValue());
        return gatewayCase.effectiveLogicOperator() == LogicOperator.OR
                ? gatewayCase.getConditions().stream().anyMatch(test)
                : gatewayCase.getConditions().stream().allMatch(test);
    }
}
