package com.lifesup.ticketflow.engine.node.gateway;

import com.lifesup.ticketflow.engine.workflow.NodeConfigReader;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.function.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/**
 * Đánh giá điều kiện rẽ nhánh theo tf:config của gateway. Được gọi trong biểu thức điều kiện của từng sequence flow
 * (xem GatewayNodeHandler.configureOutgoingFlow).
 */
@Component(ConditionEvaluator.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConditionEvaluator {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "conditionEvaluator";

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

    /** Id các nhánh khớp, theo thứ tự cấu hình. Không đánh giá được thì ném ConditionOperators.EvaluationException. */
    Set<String> evaluate(DelegateExecution execution, String gatewayElementId) {
        GatewayNodeConfig config = configReader.read(execution.getProcessDefinitionId(), gatewayElementId,
                GatewayNodeConfig.class);
        Set<String> matched = new LinkedHashSet<>();
        for (GatewayNodeConfig.Case gatewayCase : config.getCases()) {
            if (matchesCase(execution, gatewayCase)) {
                matched.add(gatewayCase.getId());
            }
        }
        return matched;
    }

    private static boolean matchesCase(DelegateExecution execution, GatewayNodeConfig.Case gatewayCase) {
        Predicate<GatewayNodeConfig.Condition> test = condition -> ConditionOperators.test(
                condition.getOperator(), execution.getVariable(condition.getField()), condition.getValue());
        return gatewayCase.getLogicOperator() == GatewayNodeConfig.LogicOperator.OR
                ? gatewayCase.getConditions().stream().anyMatch(test)
                : gatewayCase.getConditions().stream().allMatch(test);
    }
}
