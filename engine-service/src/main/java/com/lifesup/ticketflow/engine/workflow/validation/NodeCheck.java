package com.lifesup.ticketflow.engine.workflow.validation;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowDefinition;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import java.util.Optional;
import java.util.Set;

/**
 * Ngữ cảnh kiểm tra một node, truyền cho NodeHandler: ghi lỗi gắn sẵn id node, khai báo / kiểm tra biến,
 * xem các cổng ra của node và tra node khác.
 *
 * <p>Biến được khai báo ở lượt 1 (declareVariables) của mọi node, nên ở lượt 2 (validate) một biến đọc ở bất kỳ đâu
 * đều kiểm tra được; không xét thứ tự luồng.
 */
public final class NodeCheck {
    private final WorkflowDefinition workflow;
    private final WorkflowNode node;
    private final Set<String> outgoingHandles;
    private final Set<String> declaredVariables;
    private final ValidationErrors errors;

    NodeCheck(WorkflowDefinition workflow, WorkflowNode node, Set<String> outgoingHandles,
            Set<String> declaredVariables, ValidationErrors errors) {
        this.workflow = workflow;
        this.node = node;
        this.outgoingHandles = outgoingHandles;
        this.declaredVariables = declaredVariables;
        this.errors = errors;
    }

    public WorkflowNode node() {
        return node;
    }

    public String processKey() {
        return workflow.getProcessKey();
    }

    public Optional<WorkflowNode> findNode(String nodeId) {
        return workflow.findNode(nodeId);
    }

    /** Node có edge đi ra từ cổng {@code handle} không. */
    public boolean hasOutgoing(String handle) {
        return outgoingHandles.contains(handle);
    }

    public void error(ValidationCode code, String field, String message) {
        errors.add(code, node.getId(), field, message);
    }

    /** Khai báo biến node ghi ra; tên không hợp lệ thì báo lỗi. Trả về true nếu khai báo được. */
    public boolean declare(String field, String variable) {
        if (isBlank(variable)) {
            error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Thiếu tên biến");
            return false;
        }
        if (!Identifiers.isVariableName(variable)) {
            error(ValidationCode.VARIABLE_NAME_INVALID, field,
                    "Tên biến chỉ gồm chữ, số, _ và không bắt đầu bằng số hoặc '__': " + variable);
            return false;
        }
        declaredVariables.add(variable);
        return true;
    }

    /** Biến được đọc phải có tên và đã được khai báo. */
    public void requireDeclared(String field, String variable) {
        if (isBlank(variable)) {
            error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Chưa chọn biến");
        } else if (!declaredVariables.contains(variable)) {
            error(ValidationCode.VARIABLE_NOT_DECLARED, field, "Biến chưa được khai báo: " + variable);
        }
    }

    public void requireField(String field, String value) {
        if (isBlank(value)) {
            error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Thiếu tên trường");
        }
    }

    /** Tên field sẽ được chèn vào biểu thức Flowable nên phải gồm ký tự an toàn. */
    public void requireFieldKey(String field, String value) {
        if (isBlank(value)) {
            error(ValidationCode.MAPPING_FIELD_REQUIRED, field, "Thiếu tên trường");
        } else if (!Identifiers.isSafeKey(value)) {
            error(ValidationCode.FIELD_KEY_INVALID, field, "Tên trường chỉ gồm chữ, số, _ . -");
        }
    }
}
