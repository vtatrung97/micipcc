package com.lifesup.ticketflow.engine.validation;

import static com.lifesup.ticketflow.engine.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.common.constants.SourceHandles;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCase;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.JoinNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

/**
 * Kiểm tra cấu trúc (topology) của quy trình rồi giao phần cấu hình từng node cho {@link NodeConfigValidator}.
 * Mọi lỗi được gom lại và ném một lần.
 *
 * <p>Cổng ra (sourceHandle) hợp lệ theo loại node:
 * <pre>
 *  START, JOIN, USER_TASK, NOTIFICATION, SUB_PROCESS   next
 *  SYSTEM_TASK                                         success | error
 *  GATEWAY_EXCLUSIVE, GATEWAY_INCLUSIVE                &lt;caseId&gt; | default | error
 *  GATEWAY_PARALLEL                                    &lt;caseId&gt; | default   (default là một nhánh song song)
 *  END                                                 (không có)
 * </pre>
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkflowValidator {
    public static final int MAX_NODES = 500;
    public static final int MAX_EDGES = 1_000;

    NodeConfigValidator nodeConfigValidator;

    public void validate(WorkflowDefinition workflow) {
        ValidationErrors errors = new ValidationErrors();
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();

        validateProcess(workflow, errors);
        duplicates(nodes, WorkflowNode::getId, ValidationCode.DUPLICATE_NODE_ID, "id", errors);
        duplicates(nodes, WorkflowNode::getKey, ValidationCode.DUPLICATE_NODE_KEY, "key", errors);
        duplicates(edges, WorkflowEdge::getId, ValidationCode.DUPLICATE_EDGE_ID, "id", errors);
        validateNodes(nodes, errors);

        Map<String, WorkflowNode> byId = nodes.stream()
                .filter(node -> !isBlank(node.getId()))
                .collect(Collectors.toMap(WorkflowNode::getId, Function.identity(), (first, ignored) -> first));
        Map<String, List<WorkflowEdge>> outgoing = validateEdges(edges, byId, errors);
        validateOutgoing(nodes, outgoing, errors);
        validateGatewayJoinPairs(nodes, byId, errors);
        validateReachability(nodes, outgoing, errors);

        nodeConfigValidator.validate(workflow, errors);
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

    /** Kiểm tra từng edge và trả về danh sách edge đi ra theo node (kể cả edge có handle sai, để vẫn xét được luồng). */
    private static Map<String, List<WorkflowEdge>> validateEdges(List<WorkflowEdge> edges,
            Map<String, WorkflowNode> byId, ValidationErrors errors) {
        Map<String, List<WorkflowEdge>> outgoing = new HashMap<>();
        Set<String> connected = new HashSet<>();
        Set<String> usedHandles = new HashSet<>();
        for (WorkflowEdge edge : edges) {
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
            validateHandle(edge, source, errors);
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

    private static void validateHandle(WorkflowEdge edge, WorkflowNode source, ValidationErrors errors) {
        String handle = edge.getSourceHandle();
        if (source.getType() == NodeType.GATEWAY_PARALLEL && SourceHandles.ERROR.equals(handle)) {
            errors.add(ValidationCode.PARALLEL_ERROR_BRANCH_NOT_ALLOWED, edge.getId(), "sourceHandle",
                    "Gateway song song không đánh giá điều kiện nên không có nhánh lỗi");
            return;
        }
        boolean valid = switch (source.getType()) {
            case START, JOIN, USER_TASK, NOTIFICATION, SUB_PROCESS -> SourceHandles.NEXT.equals(handle);
            case SYSTEM_TASK -> SourceHandles.SUCCESS.equals(handle) || SourceHandles.ERROR.equals(handle);
            case GATEWAY_EXCLUSIVE, GATEWAY_INCLUSIVE -> SourceHandles.DEFAULT.equals(handle)
                    || SourceHandles.ERROR.equals(handle) || caseIds(source).contains(handle);
            case GATEWAY_PARALLEL -> SourceHandles.DEFAULT.equals(handle) || caseIds(source).contains(handle);
            case END -> false;
        };
        if (!valid) {
            errors.add(ValidationCode.INVALID_SOURCE_HANDLE, edge.getId(), "sourceHandle",
                    "Cổng ra '" + handle + "' không hợp lệ với node " + source.getType());
        }
    }

    /**
     * Node (trừ END) phải có cổng ra; SYSTEM_TASK phải có nhánh success; gateway có điều kiện phải có nhánh default;
     * mỗi nhánh gateway phải có edge.
     */
    private static void validateOutgoing(List<WorkflowNode> nodes, Map<String, List<WorkflowEdge>> outgoing,
            ValidationErrors errors) {
        for (WorkflowNode node : nodes) {
            if (node.getType() == NodeType.END || isBlank(node.getId())) {
                continue;
            }
            Set<String> handles = outgoing.getOrDefault(node.getId(), List.of()).stream()
                    .map(WorkflowEdge::getSourceHandle)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            if (handles.isEmpty()) {
                errors.add(ValidationCode.NODE_OUTGOING_REQUIRED, node.getId(), "id", "Node chưa có bước tiếp theo");
                continue;
            }
            if (node.getType() == NodeType.SYSTEM_TASK && !handles.contains(SourceHandles.SUCCESS)) {
                errors.add(ValidationCode.SYSTEM_TASK_SUCCESS_EDGE_REQUIRED, node.getId(), "id",
                        "Gọi API cần nhánh thành công");
            }
            // Không nhánh nào khớp thì Flowable báo lỗi nếu không có nhánh mặc định
            if (node.getType().isConditionalGateway() && !handles.contains(SourceHandles.DEFAULT)) {
                errors.add(ValidationCode.GATEWAY_DEFAULT_EDGE_REQUIRED, node.getId(), "id",
                        "Gateway có điều kiện cần nhánh mặc định");
            }
            if (node.getType().isGateway()) {
                caseIds(node).stream()
                        .filter(caseId -> !handles.contains(caseId))
                        .forEach(caseId -> errors.add(ValidationCode.GATEWAY_CASE_EDGE_REQUIRED, node.getId(),
                                "config.cases", "Nhánh " + caseId + " chưa được nối"));
            }
        }
    }

    /** Gateway và JOIN phải trỏ đúng vào nhau. */
    private static void validateGatewayJoinPairs(List<WorkflowNode> nodes, Map<String, WorkflowNode> byId,
            ValidationErrors errors) {
        for (WorkflowNode node : nodes) {
            if (node.getType().isGateway()) {
                String joinId = node.config(GatewayNodeConfig.class).getJoinNodeId();
                WorkflowNode join = byId.get(joinId);
                if (join == null || join.getType() != NodeType.JOIN) {
                    errors.add(ValidationCode.GATEWAY_JOIN_NOT_FOUND, node.getId(), "config.joinNodeId",
                            "Gateway phải trỏ tới một node JOIN");
                } else if (!node.getId().equals(join.config(JoinNodeConfig.class).getGatewayNodeId())) {
                    errors.add(ValidationCode.GATEWAY_JOIN_MISMATCH, join.getId(), "config.gatewayNodeId",
                            "Gateway và JOIN không trỏ vào nhau");
                }
            } else if (node.getType() == NodeType.JOIN) {
                WorkflowNode gateway = byId.get(node.config(JoinNodeConfig.class).getGatewayNodeId());
                if (gateway == null || !gateway.getType().isGateway()) {
                    errors.add(ValidationCode.JOIN_GATEWAY_NOT_FOUND, node.getId(), "config.gatewayNodeId",
                            "JOIN phải trỏ tới một gateway");
                }
            }
        }
    }

    /** Mọi node phải đi tới được từ START và phải có ít nhất một END đi tới được. */
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
        boolean endReached = nodes.stream()
                .anyMatch(node -> node.getType() == NodeType.END && reached.contains(node.getId()));
        if (!endReached) {
            errors.add(ValidationCode.END_EVENT_REQUIRED, null, "nodes", "Không có node END nào đi tới được từ START");
        }
    }

    private static Set<String> caseIds(WorkflowNode gateway) {
        return gateway.config(GatewayNodeConfig.class).getCases().stream()
                .map(GatewayCase::getId)
                .filter(Objects::nonNull)
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
