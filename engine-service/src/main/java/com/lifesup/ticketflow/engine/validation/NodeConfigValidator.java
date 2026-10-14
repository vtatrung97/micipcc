package com.lifesup.ticketflow.engine.validation;

import static com.lifesup.ticketflow.engine.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.common.enums.AssignType;
import com.lifesup.ticketflow.engine.common.enums.RecipientSource;
import com.lifesup.ticketflow.engine.dto.canvas.model.ApiInputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.ApiOutputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.EndNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.EndResultMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.FormInputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.FormOutputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCase;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCondition;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.NotificationNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.StartNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.StartVariable;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessInputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessOutputMapping;
import com.lifesup.ticketflow.engine.dto.canvas.model.SystemTaskNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.UserTaskNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Kiểm tra cấu hình của từng loại node và tham chiếu biến.
 *
 * <p>Biến được khai báo ở START.variables và ở outputs của USER_TASK / SYSTEM_TASK / SUB_PROCESS. Mọi chỗ đọc biến
 * (điều kiện gateway, inputs, người nhận thông báo, kết quả END) phải dùng biến đã khai báo. Phép kiểm tra không xét
 * thứ tự luồng: biến khai báo ở bất kỳ node nào đều được coi là có.
 */
@Component
public class NodeConfigValidator {

    public void validate(WorkflowDefinition workflow, ValidationErrors errors) {
        Set<String> declared = declaredVariables(workflow.getNodes(), errors);
        for (WorkflowNode node : workflow.getNodes()) {
            NodeContext context = new NodeContext(node, declared, errors);
            switch (node.getType()) {
                case GATEWAY_EXCLUSIVE, GATEWAY_INCLUSIVE, GATEWAY_PARALLEL -> validateGateway(context);
                case USER_TASK -> validateUserTask(context);
                case SYSTEM_TASK -> validateSystemTask(context);
                case NOTIFICATION -> validateNotification(context);
                case SUB_PROCESS -> validateSubProcess(context, workflow.getProcessKey());
                case END -> validateEnd(context);
                case START, JOIN -> {
                    // START đã kiểm khi gom biến; JOIN chỉ có gatewayNodeId, kiểm ở WorkflowValidator
                }
            }
        }
    }

    /** Gom tên biến được khai báo, đồng thời kiểm tên hợp lệ và không trùng trong START. */
    private static Set<String> declaredVariables(List<WorkflowNode> nodes, ValidationErrors errors) {
        Set<String> declared = new HashSet<>();
        for (WorkflowNode node : nodes) {
            switch (node.getType()) {
                case START -> {
                    List<StartVariable> variables = node.config(StartNodeConfig.class).getVariables();
                    for (int i = 0; i < variables.size(); i++) {
                        String name = variables.get(i).getName();
                        String field = "config.variables[" + i + "].name";
                        if (declareVariable(node, field, name, errors) && !declared.add(name)) {
                            errors.add(ValidationCode.DUPLICATE_VARIABLE, node.getId(), field, "Biến bị khai báo trùng: " + name);
                        }
                    }
                }
                case USER_TASK -> {
                    List<FormOutputMapping> outputs = node.config(UserTaskNodeConfig.class).getOutputs();
                    for (int i = 0; i < outputs.size(); i++) {
                        addDeclared(node, "config.outputs[" + i + "].variable", outputs.get(i).getVariable(), declared, errors);
                    }
                }
                case SYSTEM_TASK -> {
                    List<ApiOutputMapping> outputs = node.config(SystemTaskNodeConfig.class).getOutputs();
                    for (int i = 0; i < outputs.size(); i++) {
                        addDeclared(node, "config.outputs[" + i + "].variable", outputs.get(i).getVariable(), declared, errors);
                    }
                }
                case SUB_PROCESS -> {
                    List<SubProcessOutputMapping> outputs = node.config(SubProcessNodeConfig.class).getOutputs();
                    for (int i = 0; i < outputs.size(); i++) {
                        addDeclared(node, "config.outputs[" + i + "].variable", outputs.get(i).getVariable(), declared, errors);
                    }
                }
                default -> {
                    // Các node khác không khai báo biến
                }
            }
        }
        return declared;
    }

    private static void addDeclared(WorkflowNode node, String field, String name, Set<String> declared,
            ValidationErrors errors) {
        if (declareVariable(node, field, name, errors)) {
            declared.add(name);
        }
    }

    /** Tên biến khai báo phải có và đúng quy tắc; trả về true nếu hợp lệ. */
    private static boolean declareVariable(WorkflowNode node, String field, String name, ValidationErrors errors) {
        if (isBlank(name)) {
            errors.add(ValidationCode.MAPPING_FIELD_REQUIRED, node.getId(), field, "Thiếu tên biến");
            return false;
        }
        if (!Identifiers.isVariableName(name)) {
            errors.add(ValidationCode.VARIABLE_NAME_INVALID, node.getId(), field,
                    "Tên biến chỉ gồm chữ, số, _ và không bắt đầu bằng số hoặc '__': " + name);
            return false;
        }
        return true;
    }

    private static void validateGateway(NodeContext context) {
        GatewayNodeConfig config = context.node().config(GatewayNodeConfig.class);
        boolean conditional = context.node().getType().isConditionalGateway();
        if (config.getCases().isEmpty()) {
            context.error(ValidationCode.GATEWAY_CASE_REQUIRED, "config.cases", "Gateway cần ít nhất một nhánh");
        }
        Set<String> caseIds = new HashSet<>();
        for (int i = 0; i < config.getCases().size(); i++) {
            GatewayCase gatewayCase = config.getCases().get(i);
            String casePath = "config.cases[" + i + "]";
            if (isBlank(gatewayCase.getId())) {
                context.error(ValidationCode.GATEWAY_CASE_ID_REQUIRED, casePath + ".id", "Nhánh thiếu id");
            } else if (!Identifiers.isSafeKey(gatewayCase.getId())) {
                context.error(ValidationCode.GATEWAY_CASE_ID_INVALID, casePath + ".id", "Id nhánh chỉ gồm chữ, số, _ . -");
            } else if (!caseIds.add(gatewayCase.getId())) {
                context.error(ValidationCode.DUPLICATE_GATEWAY_CASE_ID, casePath + ".id", "Id nhánh bị trùng");
            }

            List<GatewayCondition> conditions = gatewayCase.getConditions();
            if (!conditional && !conditions.isEmpty()) {
                context.error(ValidationCode.PARALLEL_CONDITION_NOT_ALLOWED, casePath + ".conditions",
                        "Nhánh song song không có điều kiện");
            }
            if (conditional && conditions.isEmpty()) {
                context.error(ValidationCode.GATEWAY_CONDITION_REQUIRED, casePath + ".conditions", "Nhánh cần điều kiện");
            }
            for (int j = 0; j < conditions.size(); j++) {
                validateCondition(context, conditions.get(j), casePath + ".conditions[" + j + "]");
            }
        }
    }

    private static void validateCondition(NodeContext context, GatewayCondition condition, String path) {
        context.requireDeclared(path + ".field", condition.getField());
        if (condition.getOperator() == null) {
            context.error(ValidationCode.CONDITION_OPERATOR_REQUIRED, path + ".operator", "Thiếu toán tử so sánh");
            return;
        }
        if (condition.getOperator().requiresValue() && isBlank(condition.getValue())) {
            context.error(ValidationCode.CONDITION_VALUE_REQUIRED, path + ".value", "Thiếu giá trị so sánh");
        } else if (condition.getOperator().isNumeric() && !isNumber(condition.getValue())) {
            context.error(ValidationCode.CONDITION_VALUE_NOT_NUMBER, path + ".value",
                    "Toán tử " + condition.getOperator() + " cần giá trị là số");
        }
    }

    private static void validateUserTask(NodeContext context) {
        UserTaskNodeConfig config = context.node().config(UserTaskNodeConfig.class);
        if (config.getAssignType() == null) {
            context.error(ValidationCode.USER_TASK_ASSIGN_TYPE_REQUIRED, "config.assignType", "Thiếu cách giao việc");
        } else if (config.getAssignType() == AssignType.MANUAL
                && config.getGroupIds().isEmpty() && config.getAgentIds().isEmpty()) {
            context.error(ValidationCode.USER_TASK_ASSIGNEE_REQUIRED, "config.agentIds",
                    "Cần chọn ít nhất một nhóm hoặc người xử lý");
        } else if (config.getAssignType() == AssignType.AUTO) {
            if (config.getAssignStrategy() == null) {
                context.error(ValidationCode.USER_TASK_ASSIGN_STRATEGY_REQUIRED, "config.assignStrategy",
                        "Giao tự động cần chọn chiến lược");
            }
            if (config.getAgentIds().isEmpty()) {
                context.error(ValidationCode.USER_TASK_AGENT_REQUIRED, "config.agentIds",
                        "Giao tự động cần danh sách người xử lý");
            }
        }
        validateSla(context, config.getSlaValue(), config.getSlaUnit() != null);

        for (int i = 0; i < config.getInputs().size(); i++) {
            FormInputMapping input = config.getInputs().get(i);
            context.requireDeclared("config.inputs[" + i + "].variable", input.getVariable());
            context.requireField("config.inputs[" + i + "].formField", input.getFormField());
        }
        for (int i = 0; i < config.getOutputs().size(); i++) {
            context.requireField("config.outputs[" + i + "].formField", config.getOutputs().get(i).getFormField());
        }
    }

    private static void validateSla(NodeContext context, Integer slaValue, boolean hasUnit) {
        if (slaValue == null && !hasUnit) {
            return;
        }
        if (slaValue == null || slaValue <= 0 || !hasUnit) {
            context.error(ValidationCode.SLA_INVALID, "config.slaValue", "Thời hạn xử lý cần số dương và đơn vị");
        }
    }

    private static void validateSystemTask(NodeContext context) {
        SystemTaskNodeConfig config = context.node().config(SystemTaskNodeConfig.class);
        if (isBlank(config.getApiId())) {
            context.error(ValidationCode.SYSTEM_TASK_API_REQUIRED, "config.apiId", "Chưa chọn API");
        }
        if (config.getTimeout() != null && config.getTimeout() <= 0) {
            context.error(ValidationCode.SYSTEM_TASK_TIMEOUT_INVALID, "config.timeout", "Timeout phải lớn hơn 0");
        }
        if (config.getRetry() != null && config.getRetry() < 0) {
            context.error(ValidationCode.SYSTEM_TASK_RETRY_INVALID, "config.retry", "Số lần thử lại không được âm");
        }
        for (int i = 0; i < config.getInputs().size(); i++) {
            ApiInputMapping input = config.getInputs().get(i);
            context.requireField("config.inputs[" + i + "].apiParam", input.getApiParam());
            context.requireDeclared("config.inputs[" + i + "].variable", input.getVariable());
        }
        for (int i = 0; i < config.getOutputs().size(); i++) {
            context.requireField("config.outputs[" + i + "].apiField", config.getOutputs().get(i).getApiField());
        }
    }

    private static void validateNotification(NodeContext context) {
        NotificationNodeConfig config = context.node().config(NotificationNodeConfig.class);
        if (config.getChannel() == null) {
            context.error(ValidationCode.NOTIFICATION_CHANNEL_REQUIRED, "config.channel", "Chưa chọn kênh gửi");
        }
        if (config.getRecipientSource() == null) {
            context.error(ValidationCode.NOTIFICATION_RECIPIENT_SOURCE_REQUIRED, "config.recipientSource",
                    "Chưa chọn nguồn người nhận");
        } else if (config.getRecipientSource() == RecipientSource.VARIABLE) {
            context.requireDeclared("config.recipientVariable", config.getRecipientVariable());
        } else if (config.getRecipientUserIds().isEmpty()) {
            context.error(ValidationCode.NOTIFICATION_RECIPIENT_REQUIRED, "config.recipientUserIds",
                    "Cần chọn ít nhất một người nhận");
        }
        if (isBlank(config.getContent())) {
            context.error(ValidationCode.NOTIFICATION_CONTENT_REQUIRED, "config.content", "Thiếu nội dung thông báo");
        }
    }

    private static void validateSubProcess(NodeContext context, String processKey) {
        SubProcessNodeConfig config = context.node().config(SubProcessNodeConfig.class);
        String subProcessId = config.getSubProcessId();
        if (isBlank(subProcessId)) {
            context.error(ValidationCode.SUB_PROCESS_REF_REQUIRED, "config.subProcessId", "Chưa chọn quy trình con");
        } else if (!Identifiers.isProcessKey(subProcessId)) {
            context.error(ValidationCode.SUB_PROCESS_REF_INVALID, "config.subProcessId", "Mã quy trình con không hợp lệ");
        } else if (subProcessId.equals(processKey)) {
            context.error(ValidationCode.SUB_PROCESS_SELF_REFERENCE, "config.subProcessId",
                    "Quy trình không được gọi chính nó");
        }
        for (int i = 0; i < config.getInputs().size(); i++) {
            SubProcessInputMapping input = config.getInputs().get(i);
            context.requireFieldKey("config.inputs[" + i + "].subField", input.getSubField());
            context.requireDeclared("config.inputs[" + i + "].variable", input.getVariable());
        }
        for (int i = 0; i < config.getOutputs().size(); i++) {
            context.requireFieldKey("config.outputs[" + i + "].subField", config.getOutputs().get(i).getSubField());
        }
    }

    private static void validateEnd(NodeContext context) {
        List<EndResultMapping> results = context.node().config(EndNodeConfig.class).getResults();
        for (int i = 0; i < results.size(); i++) {
            context.requireDeclared("config.results[" + i + "].variable", results.get(i).getVariable());
            context.requireFieldKey("config.results[" + i + "].formField", results.get(i).getFormField());
        }
    }

    private static boolean isNumber(String value) {
        if (value == null) {
            return false;
        }
        try {
            new BigDecimal(value.trim());
            return true;
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    /** Ngữ cảnh kiểm tra một node: gắn sẵn node id khi ghi lỗi. */
    private record NodeContext(WorkflowNode node, Set<String> declared, ValidationErrors errors) {

        void error(ValidationCode code, String field, String message) {
            errors.add(code, node.getId(), field, message);
        }

        /** Biến được đọc phải có tên và đã được khai báo. */
        void requireDeclared(String field, String variable) {
            if (isBlank(variable)) {
                error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Chưa chọn biến");
            } else if (!declared.contains(variable)) {
                error(ValidationCode.VARIABLE_NOT_DECLARED, field, "Biến chưa được khai báo: " + variable);
            }
        }

        void requireField(String field, String value) {
            if (isBlank(value)) {
                error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Thiếu tên trường");
            }
        }

        /** Tên field được chèn vào biểu thức Flowable nên phải là ký tự an toàn. */
        void requireFieldKey(String field, String value) {
            if (isBlank(value)) {
                error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Thiếu tên trường");
            } else if (!Identifiers.isSafeKey(value)) {
                error(ValidationCode.FIELD_KEY_INVALID, field, "Tên trường chỉ gồm chữ, số, _ . -");
            }
        }
    }
}
