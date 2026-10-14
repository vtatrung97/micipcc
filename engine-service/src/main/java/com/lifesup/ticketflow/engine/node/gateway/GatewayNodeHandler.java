package com.lifesup.ticketflow.engine.node.gateway;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.SourceHandles;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.BpmnExtensions;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.Identifiers;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.ExclusiveGateway;
import org.flowable.bpmn.model.Gateway;
import org.flowable.bpmn.model.InclusiveGateway;
import org.flowable.bpmn.model.ParallelGateway;
import org.flowable.bpmn.model.SequenceFlow;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/**
 * Ba loại gateway tách nhánh. Gateway có điều kiện (exclusive / inclusive):
 * <ul>
 *   <li>mỗi nhánh là một sequence flow có điều kiện gọi ConditionEvaluator;</li>
 *   <li>nhánh {@code default} (bắt buộc) là default flow của gateway;</li>
 *   <li>có nhánh {@code error}: BPMN không cho gắn boundary vào gateway, nên chèn service task
 *       "đánh giá điều kiện" trước gateway, lỗi đánh giá → boundary error → nhánh error.</li>
 * </ul>
 *
 * <pre>
 *  ──► [Đánh giá điều kiện] ──► &lt;gateway&gt; ──caseId / default──►
 *            └─(GATEWAY_ERROR)──────────────────error──►
 * </pre>
 *
 * Gateway parallel chạy mọi nhánh (kể cả {@code default}), không có điều kiện, không có nhánh error.
 */
@Component
public class GatewayNodeHandler extends NodeHandler<GatewayNodeConfig> {
    /** Mã lỗi BPMN khi không đánh giá được điều kiện (thiếu dữ liệu, sai kiểu). */
    public static final String ERROR_GATEWAY = "GATEWAY_ERROR";
    /** tf:gatewayRef trên task "đánh giá điều kiện": id gateway mà task phục vụ. */
    static final String EXTENSION_GATEWAY_REF = "gatewayRef";

    public GatewayNodeHandler() {
        super(GatewayNodeConfig.class, NodeType.GATEWAY_EXCLUSIVE, NodeType.GATEWAY_INCLUSIVE,
                NodeType.GATEWAY_PARALLEL);
    }

    @Override
    public boolean isValidHandle(WorkflowNode node, GatewayNodeConfig config, String handle) {
        if (SourceHandles.DEFAULT.equals(handle)) {
            return true;
        }
        if (SourceHandles.ERROR.equals(handle)) {
            return node.getType().isConditionalGateway();
        }
        return handle != null && findCase(config, handle).isPresent();
    }

    @Override
    public void validate(GatewayNodeConfig config, NodeCheck check) {
        boolean conditional = check.node().getType().isConditionalGateway();
        if (config.getCases().isEmpty()) {
            check.error(ValidationCode.GATEWAY_CASE_REQUIRED, "config.cases", "Gateway cần ít nhất một nhánh");
        }
        Set<String> caseIds = new HashSet<>();
        for (int i = 0; i < config.getCases().size(); i++) {
            GatewayNodeConfig.Case gatewayCase = config.getCases().get(i);
            String casePath = "config.cases[" + i + "]";
            validateCaseId(gatewayCase.getId(), casePath + ".id", caseIds, check);

            List<GatewayNodeConfig.Condition> conditions = gatewayCase.getConditions();
            if (!conditional && !conditions.isEmpty()) {
                check.error(ValidationCode.PARALLEL_CONDITION_NOT_ALLOWED, casePath + ".conditions",
                        "Nhánh song song không có điều kiện");
            }
            if (conditional && conditions.isEmpty()) {
                check.error(ValidationCode.GATEWAY_CONDITION_REQUIRED, casePath + ".conditions", "Nhánh cần điều kiện");
            }
            for (int j = 0; j < conditions.size(); j++) {
                validateCondition(conditions.get(j), casePath + ".conditions[" + j + "]", check);
            }
        }

        // Không nhánh nào khớp mà không có default flow thì Flowable báo lỗi khi chạy
        if (conditional && !check.hasOutgoing(SourceHandles.DEFAULT)) {
            check.error(ValidationCode.GATEWAY_DEFAULT_EDGE_REQUIRED, "id", "Gateway có điều kiện cần nhánh mặc định");
        }
        caseIds.stream()
                .filter(caseId -> !check.hasOutgoing(caseId))
                .forEach(caseId -> check.error(ValidationCode.GATEWAY_CASE_EDGE_REQUIRED, "config.cases",
                        "Nhánh " + caseId + " chưa được nối"));
        validateJoin(config.getJoinNodeId(), check);
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, GatewayNodeConfig config, ConversionContext context) {
        Gateway gateway = init(newGateway(node.getType()), node, context);
        boolean hasErrorBranch = node.getType().isConditionalGateway()
                && context.hasOutgoing(node.getId(), SourceHandles.ERROR);
        if (!hasErrorBranch) {
            return ConvertedNode.single(gateway);
        }

        ServiceTask evaluation = new ServiceTask();
        evaluation.setId(context.newId(gateway.getId(), "_evaluate"));
        evaluation.setName("Đánh giá điều kiện: " + node.getName());
        delegateTo(evaluation, GatewayEvaluationDelegate.BEAN);
        BpmnExtensions.put(evaluation, EXTENSION_GATEWAY_REF, gateway.getId());
        BoundaryEvent error = errorBoundary(evaluation, ERROR_GATEWAY, context);
        SequenceFlow toGateway = context.connect(evaluation, gateway);

        return new ConvertedNode(evaluation, gateway, Map.of(SourceHandles.ERROR, error),
                List.of(evaluation, error, gateway, toGateway));
    }

    @Override
    public void configureOutgoingFlow(SequenceFlow flow, String handle, WorkflowNode node, GatewayNodeConfig config,
            ConversionContext context) {
        boolean conditional = node.getType().isConditionalGateway();
        if (SourceHandles.ERROR.equals(handle)) {
            return;
        }
        if (SourceHandles.DEFAULT.equals(handle)) {
            if (conditional) {
                ((Gateway) flow.getSourceFlowElement()).setDefaultFlow(flow.getId());
            }
            return;
        }
        GatewayNodeConfig.Case gatewayCase = findCase(config, handle)
                .orElseThrow(() -> new IllegalStateException("Unknown gateway case: " + handle));
        flow.setName(gatewayCase.getName());
        if (conditional) {
            // Id gateway và id nhánh đã được giới hạn ký tự an toàn nên chèn thẳng vào biểu thức được
            flow.setConditionExpression("${" + ConditionEvaluator.BEAN + ".matches(execution, '"
                    + context.bpmnId(node.getId()) + "', '" + gatewayCase.getId() + "')}");
        }
    }

    /** Gateway BPMN cùng loại với node; JOIN cũng dùng để gộp nhánh đúng kiểu. */
    static Gateway newGateway(NodeType type) {
        return switch (type) {
            case GATEWAY_EXCLUSIVE -> new ExclusiveGateway();
            case GATEWAY_INCLUSIVE -> new InclusiveGateway();
            case GATEWAY_PARALLEL -> new ParallelGateway();
            default -> throw new IllegalArgumentException("Not a gateway: " + type);
        };
    }

    private static Optional<GatewayNodeConfig.Case> findCase(GatewayNodeConfig config, String caseId) {
        return config.getCases().stream().filter(item -> caseId.equals(item.getId())).findFirst();
    }

    private static void validateCaseId(String caseId, String field, Set<String> caseIds, NodeCheck check) {
        if (isBlank(caseId)) {
            check.error(ValidationCode.GATEWAY_CASE_ID_REQUIRED, field, "Nhánh thiếu id");
        } else if (!Identifiers.isSafeKey(caseId)) {
            check.error(ValidationCode.GATEWAY_CASE_ID_INVALID, field, "Id nhánh chỉ gồm chữ, số, _ . -");
        } else if (SourceHandles.DEFAULT.equals(caseId) || SourceHandles.ERROR.equals(caseId)) {
            check.error(ValidationCode.GATEWAY_CASE_ID_INVALID, field, "Id nhánh không được là default / error");
        } else if (!caseIds.add(caseId)) {
            check.error(ValidationCode.DUPLICATE_GATEWAY_CASE_ID, field, "Id nhánh bị trùng");
        }
    }

    private static void validateCondition(GatewayNodeConfig.Condition condition, String path, NodeCheck check) {
        check.requireDeclared(path + ".field", condition.getField());
        GatewayNodeConfig.Operator operator = condition.getOperator();
        if (operator == null) {
            check.error(ValidationCode.CONDITION_OPERATOR_REQUIRED, path + ".operator", "Thiếu toán tử so sánh");
        } else if (operator.requiresValue() && isBlank(condition.getValue())) {
            check.error(ValidationCode.CONDITION_VALUE_REQUIRED, path + ".value", "Thiếu giá trị so sánh");
        } else if (operator.isNumeric() && !isNumber(condition.getValue())) {
            check.error(ValidationCode.CONDITION_VALUE_NOT_NUMBER, path + ".value",
                    "Toán tử " + operator + " cần giá trị là số");
        }
    }

    /** Gateway và JOIN phải trỏ vào nhau. */
    private static void validateJoin(String joinNodeId, NodeCheck check) {
        Optional<WorkflowNode> join = isBlank(joinNodeId) ? Optional.empty() : check.findNode(joinNodeId);
        if (join.isEmpty() || join.get().getType() != NodeType.JOIN) {
            check.error(ValidationCode.GATEWAY_JOIN_NOT_FOUND, "config.joinNodeId", "Gateway phải trỏ tới một node JOIN");
        } else if (!check.node().getId().equals(join.get().config(JoinNodeConfig.class).getGatewayNodeId())) {
            check.error(ValidationCode.GATEWAY_JOIN_MISMATCH, "config.joinNodeId", "Gateway và JOIN không trỏ vào nhau");
        }
    }

    private static boolean isNumber(String value) {
        try {
            new BigDecimal(value.trim());
            return true;
        } catch (NumberFormatException exception) {
            return false;
        }
    }
}
