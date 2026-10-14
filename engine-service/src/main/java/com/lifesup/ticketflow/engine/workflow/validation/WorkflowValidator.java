package com.lifesup.ticketflow.engine.workflow.validation;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.handler.NodeHandlers;
import com.lifesup.ticketflow.engine.workflow.model.NodeType;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowDefinition;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowEdge;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

/**
 * Kiểm tra quy trình. Ở đây chỉ có các quy tắc xét cả đồ thị (id / key, START / END, edge, đi tới được);
 * quy tắc riêng của từng loại node nằm trong NodeHandler tương ứng. Mọi lỗi được gom và ném một lần.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkflowValidator {
    public static final int MAX_NODES = 500;
    public static final int MAX_EDGES = 1_000;

    NodeHandlers handlers;

    public void validate(WorkflowDefinition workflow) {
        ValidationErrors errors = new ValidationErrors();
        validateProcess(workflow, errors);
        duplicates(workflow.getNodes(), WorkflowNode::getId, ValidationCode.DUPLICATE_NODE_ID, "id", errors);
        duplicates(workflow.getNodes(), WorkflowNode::getKey, ValidationCode.DUPLICATE_NODE_KEY, "key", errors);
        duplicates(workflow.getEdges(), WorkflowEdge::getId, ValidationCode.DUPLICATE_EDGE_ID, "id", errors);
        validateNodes(workflow.getNodes(), errors);

        Map<String, List<WorkflowEdge>> outgoing = validateEdges(workflow, errors);
        validateReachability(workflow.getNodes(), outgoing, errors);
        validateNodeConfigs(workflow, outgoing, errors);
        errors.throwIfAny();
    }

    private static void validateProcess(WorkflowDefinition workflow, ValidationErrors errors) {
        if (isBlank(workflow.getProcessKey())) {
            errors.add(ValidationCode.PROCESS_KEY_REQUIRED, null, "processKey", "Thiếu mã quy trình");
        } else if (!Identifiers.isProcessKey(workflow.getProcessKey())) {
            errors.add(ValidationCode.PROCESS_KEY_INVALID, null, "processKey", "Mã quy trình chứa ký tự không hợp lệ");
        }
        if (workflow.getNodes().size() > MAX_NODES) {
            errors.add(ValidationCode.NODE_LIMIT_EXCEEDED, null, "nodes", "Tối đa " + MAX_NODES + " node");
        }
        if (workflow.getEdges().size() > MAX_EDGES) {
            errors.add(ValidationCode.EDGE_LIMIT_EXCEEDED, null, "edges", "Tối đa " + MAX_EDGES + " edge");
        }
    }

    private static void validateNodes(List<WorkflowNode> nodes, ValidationErrors errors) {
        for (WorkflowNode node : nodes) {
            if (isBlank(node.getId())) {
                errors.add(ValidationCode.NODE_ID_REQUIRED, null, "id", "Node thiếu id");
            }
            if (isBlank(node.getKey())) {
                errors.add(ValidationCode.NODE_KEY_REQUIRED, node.getId(), "key", "Node thiếu key");
            } else if (!Identifiers.isSafeKey(node.getKey())) {
                errors.add(ValidationCode.NODE_KEY_INVALID, node.getId(), "key", "Key chỉ gồm chữ, số, _ . -");
            }
            boolean nameOptional = node.getType() == NodeType.START || node.getType() == NodeType.END
                    || node.getType() == NodeType.JOIN;
            if (!nameOptional && isBlank(node.getName())) {
                errors.add(ValidationCode.NODE_NAME_REQUIRED, node.getId(), "name", "Node thiếu tên");
            }
        }
        long starts = nodes.stream().filter(node -> node.getType() == NodeType.START).count();
        if (starts == 0) {
            errors.add(ValidationCode.START_EVENT_REQUIRED, null, "nodes", "Quy trình cần đúng một node START");
        } else if (starts > 1) {
            errors.add(ValidationCode.MULTIPLE_START_EVENTS, null, "nodes", "Quy trình chỉ được có một node START");
        }
        if (nodes.stream().noneMatch(node -> node.getType() == NodeType.END)) {
            errors.add(ValidationCode.END_EVENT_REQUIRED, null, "nodes", "Quy trình cần ít nhất một node END");
        }
    }

    /** Kiểm tra từng edge; trả về edge đi ra theo node (kể cả edge sai cổng, để vẫn xét được luồng). */
    private Map<String, List<WorkflowEdge>> validateEdges(WorkflowDefinition workflow, ValidationErrors errors) {
        Map<String, WorkflowNode> byId = workflow.getNodes().stream()
                .filter(node -> !isBlank(node.getId()))
                .collect(Collectors.toMap(WorkflowNode::getId, Function.identity(), (first, ignored) -> first));
        Map<String, List<WorkflowEdge>> outgoing = new HashMap<>();
        Set<String> connected = new HashSet<>();
        Set<String> usedHandles = new HashSet<>();
        for (WorkflowEdge edge : workflow.getEdges()) {
            if (isBlank(edge.getId())) {
                errors.add(ValidationCode.EDGE_ID_REQUIRED, null, "id", "Edge thiếu id");
            }
            WorkflowNode source = byId.get(edge.getSourceNodeId());
            WorkflowNode target = byId.get(edge.getTargetNodeId());
            if (source == null) {
                errors.add(ValidationCode.EDGE_SOURCE_NOT_FOUND, edge.getId(), "source", "Node nguồn không tồn tại");
            }
            if (target == null) {
                errors.add(ValidationCode.EDGE_TARGET_NOT_FOUND, edge.getId(), "target", "Node đích không tồn tại");
            }
            if (source == null || target == null) {
                continue;
            }
            if (!handlers.of(source).isValidHandle(source, source.getConfig(), edge.getSourceHandle())) {
                errors.add(ValidationCode.INVALID_SOURCE_HANDLE, edge.getId(), "sourceHandle",
                        "Cổng ra '" + edge.getSourceHandle() + "' không hợp lệ với node " + source.getType());
            }
            if (!usedHandles.add(source.getId() + "\u0000" + edge.getSourceHandle())) {
                errors.add(ValidationCode.DUPLICATE_SOURCE_HANDLE, edge.getId(), "sourceHandle",
                        "Mỗi cổng ra chỉ được nối một edge");
            }
            if (target.getType() == NodeType.START) {
                errors.add(ValidationCode.INVALID_EDGE_TARGET, edge.getId(), "target", "Không được nối vào node START");
            }
            outgoing.computeIfAbsent(source.getId(), ignored -> new ArrayList<>()).add(edge);
            connected.add(source.getId());
            connected.add(target.getId());
        }
        byId.values().stream()
                .filter(node -> !connected.contains(node.getId()))
                .forEach(node -> errors.add(ValidationCode.ORPHAN_NODE, node.getId(), "id", "Node chưa được nối"));
        return outgoing;
    }

    /** Mọi node phải đi tới được từ START, và phải có END đi tới được. */
    private static void validateReachability(List<WorkflowNode> nodes, Map<String, List<WorkflowEdge>> outgoing,
            ValidationErrors errors) {
        WorkflowNode start = nodes.stream().filter(node -> node.getType() == NodeType.START).findFirst().orElse(null);
        if (start == null) {
            return;
        }
        Set<String> reached = new HashSet<>();
        Deque<String> queue = new ArrayDeque<>(List.of(start.getId()));
        while (!queue.isEmpty()) {
            String current = queue.remove();
            if (reached.add(current)) {
                outgoing.getOrDefault(current, List.of()).forEach(edge -> queue.add(edge.getTargetNodeId()));
            }
        }
        nodes.stream()
                .filter(node -> !isBlank(node.getId()) && !reached.contains(node.getId()))
                .forEach(node -> errors.add(ValidationCode.UNREACHABLE_NODE, node.getId(), "id",
                        "Không đi tới được node này từ START"));
        if (nodes.stream().noneMatch(node -> node.getType() == NodeType.END && reached.contains(node.getId()))) {
            errors.add(ValidationCode.END_EVENT_REQUIRED, null, "nodes", "Không có node END nào đi tới được từ START");
        }
    }

    /**
     * Giao cho handler của từng node, hai lượt: lượt 1 mọi node khai báo biến ghi ra, lượt 2 kiểm tra cấu hình
     * (lúc này đã biết đủ biến để kiểm tra chỗ đọc biến).
     */
    private void validateNodeConfigs(WorkflowDefinition workflow, Map<String, List<WorkflowEdge>> outgoing,
            ValidationErrors errors) {
        Set<String> declaredVariables = new HashSet<>();
        List<NodeCheck> checks = workflow.getNodes().stream()
                .map(node -> new NodeCheck(workflow, node, handlesOf(outgoing, node), declaredVariables, errors))
                .toList();

        checks.forEach(check -> handlers.of(check.node()).declareVariables(check.node().getConfig(), check));
        for (NodeCheck check : checks) {
            WorkflowNode node = check.node();
            if (node.getType() != NodeType.END && !outgoing.containsKey(node.getId())) {
                check.error(ValidationCode.NODE_OUTGOING_REQUIRED, "id", "Node chưa có bước tiếp theo");
            }
            handlers.of(node).validate(node.getConfig(), check);
        }
    }

    private static Set<String> handlesOf(Map<String, List<WorkflowEdge>> outgoing, WorkflowNode node) {
        return outgoing.getOrDefault(node.getId(), List.of()).stream()
                .map(WorkflowEdge::getSourceHandle)
                .collect(Collectors.toSet());
    }

    private static <T> void duplicates(List<T> values, Function<T, String> key, ValidationCode code, String field,
            ValidationErrors errors) {
        Set<String> seen = new HashSet<>();
        for (T value : values) {
            String id = key.apply(value);
            if (!isBlank(id) && !seen.add(id)) {
                errors.add(code, id, field, "Giá trị bị trùng: " + id);
            }
        }
    }
}
