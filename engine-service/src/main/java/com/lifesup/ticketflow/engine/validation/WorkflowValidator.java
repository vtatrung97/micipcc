package com.lifesup.ticketflow.engine.validation;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowValidationError;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Kiểm tra cấu trúc và semantics của canonical workflow. */
@Component
public final class WorkflowValidator {
    public static final int MAX_NODES = 500;
    public static final int MAX_EDGES = 1_000;
    private static final Pattern SAFE_KEY = Pattern.compile("^[A-Za-z0-9_.-]+$");

    /** Kiểm tra cấu trúc FlowDefinition trước khi mapping. */
    public void validateDocument(CanvasDocument document) {
        List<WorkflowValidationError> errors = new ArrayList<>();
        if (document == null) {
            add(errors, "CANVAS_JSON_INVALID", null, "modelJson", "Canvas document is required");
        } else {
            if (document.getNodes() == null) add(errors, "CANVAS_JSON_INVALID", null, "nodes", "nodes must not be null");
            if (document.getEdges() == null) add(errors, "CANVAS_JSON_INVALID", null, "edges", "edges must not be null");
            if (document.getNodes() != null) document.getNodes().stream().filter(Objects::nonNull).forEach(node -> {
                if (node.getPosition() == null) add(errors, "NODE_POSITION_REQUIRED", node.getId(), "position", "Node position is required");
                if (node.getConfig() == null || !node.getConfig().isObject())
                    add(errors, "NODE_CONFIG_INVALID", node.getId(), "config", "Node config must be an object");
            });
        }
        throwIfAny(errors);
    }

    /** Thu thập các lỗi topology và config trong một lần validate. */
    public void validate(WorkflowDefinition workflow) {
        List<WorkflowValidationError> errors = new ArrayList<>();
        List<WorkflowNode> nodes = workflow.getNodes();
        List<WorkflowEdge> edges = workflow.getEdges();
        if (blank(workflow.getProcessKey())) add(errors, "PROCESS_KEY_REQUIRED", null, "processKey", "processKey is required");
        if (nodes.size() > MAX_NODES) add(errors, "NODE_LIMIT_EXCEEDED", null, "nodes", "Maximum node count is " + MAX_NODES);
        if (edges.size() > MAX_EDGES) add(errors, "EDGE_LIMIT_EXCEEDED", null, "edges", "Maximum edge count is " + MAX_EDGES);

        duplicates(nodes, WorkflowNode::getId, "DUPLICATE_NODE_ID", "id", errors);
        duplicates(nodes, WorkflowNode::getKey, "DUPLICATE_NODE_KEY", "key", errors);
        duplicates(edges, WorkflowEdge::getId, "DUPLICATE_EDGE_ID", "id", errors);
        validateNodes(nodes, errors);

        Map<String, WorkflowNode> byId = nodes.stream().filter(node -> !blank(node.getId()))
                .collect(Collectors.toMap(WorkflowNode::getId, Function.identity(), (first, ignored) -> first));
        Map<String, List<WorkflowEdge>> outgoing = validateEdges(edges, byId, errors);
        validateGatewayEdges(nodes, outgoing, errors);
        validateJoinPairs(nodes, byId, errors);
        validateReachability(nodes, outgoing, errors);
        throwIfAny(errors);
    }

    private static void validateNodes(List<WorkflowNode> nodes, List<WorkflowValidationError> errors) {
        for (WorkflowNode node : nodes) {
            if (blank(node.getId())) add(errors, "NODE_ID_REQUIRED", null, "id", "Node id is required");
            if (blank(node.getKey())) add(errors, "NODE_KEY_REQUIRED", node.getId(), "key", "Node key is required");
            else if (!SAFE_KEY.matcher(node.getKey()).matches())
                add(errors, "NODE_KEY_INVALID", node.getId(), "key", "Node key contains unsupported characters");
            if (node.getType() == null) add(errors, "NODE_TYPE_UNSUPPORTED", node.getId(), "type", "Node type is unsupported");
            if (node.getType() != NodeType.START && node.getType() != NodeType.END
                    && node.getType() != NodeType.JOIN && blank(node.getName()))
                add(errors, "NODE_NAME_REQUIRED", node.getId(), "name", "Node name is required");
            if (node.getType() == NodeType.SUB_PROCESS && blank(stringConfig(node, "subProcessId")))
                add(errors, "SUB_PROCESS_REF_REQUIRED", node.getId(), "config.subProcessId", "subProcessId is required");
            else if (node.getType() == NodeType.SUB_PROCESS
                    && !SAFE_KEY.matcher(stringConfig(node, "subProcessId")).matches())
                add(errors, "SUB_PROCESS_REF_INVALID", node.getId(), "config.subProcessId", "subProcessId contains unsupported characters");
            if (isGateway(node.getType())) validateGatewayCases(node, errors);
        }
        long starts = nodes.stream().filter(node -> node.getType() == NodeType.START).count();
        if (starts == 0) add(errors, "START_EVENT_REQUIRED", null, "nodes", "Exactly one START node is required");
        if (starts > 1) add(errors, "MULTIPLE_START_EVENTS", null, "nodes", "Only one START node is allowed");
        if (nodes.stream().noneMatch(node -> node.getType() == NodeType.END))
            add(errors, "END_EVENT_REQUIRED", null, "nodes", "At least one END node is required");
    }

    private static Map<String, List<WorkflowEdge>> validateEdges(List<WorkflowEdge> edges,
            Map<String, WorkflowNode> byId, List<WorkflowValidationError> errors) {
        Map<String, List<WorkflowEdge>> outgoing = new HashMap<>();
        Map<String, Integer> degree = new HashMap<>();
        Set<String> usedHandles = new HashSet<>();
        for (WorkflowEdge edge : edges) {
            if (blank(edge.getId())) add(errors, "EDGE_ID_REQUIRED", null, "id", "Edge id is required");
            WorkflowNode source = byId.get(edge.getSourceNodeId());
            WorkflowNode target = byId.get(edge.getTargetNodeId());
            if (source == null) add(errors, "EDGE_SOURCE_NOT_FOUND", edge.getId(), "source", "Edge source does not exist");
            if (target == null) add(errors, "EDGE_TARGET_NOT_FOUND", edge.getId(), "target", "Edge target does not exist");
            if (source == null || target == null) continue;
            validateHandle(edge, source, errors);
            String handleKey = source.getId() + "\u0000" + edge.getSourceHandle();
            if (!usedHandles.add(handleKey))
                add(errors, "DUPLICATE_SOURCE_HANDLE", edge.getId(), "sourceHandle", "A sourceHandle can only have one outgoing edge");
            if (source.getType() == NodeType.END)
                add(errors, "INVALID_SOURCE_HANDLE", edge.getId(), "sourceHandle", "END cannot have outgoing edges");
            if (target.getType() == NodeType.START)
                add(errors, "INVALID_EDGE_TARGET", edge.getId(), "target", "START cannot have incoming edges");
            outgoing.computeIfAbsent(source.getId(), ignored -> new ArrayList<>()).add(edge);
            degree.merge(source.getId(), 1, Integer::sum);
            degree.merge(target.getId(), 1, Integer::sum);
        }
        for (WorkflowNode node : byId.values()) {
            if (degree.getOrDefault(node.getId(), 0) == 0)
                add(errors, "ORPHAN_NODE", node.getId(), "id", "Node has no incoming or outgoing edge");
        }
        return outgoing;
    }

    private static void validateGatewayEdges(List<WorkflowNode> nodes,
            Map<String, List<WorkflowEdge>> outgoing, List<WorkflowValidationError> errors) {
        for (WorkflowNode gateway : nodes) {
            if (!isGateway(gateway.getType())) continue;
            Set<String> handles = outgoing.getOrDefault(gateway.getId(), List.of()).stream()
                    .map(WorkflowEdge::getSourceHandle).collect(Collectors.toSet());
            for (String caseId : caseIds(gateway)) {
                if (!handles.contains(caseId))
                    add(errors, "GATEWAY_CASE_EDGE_REQUIRED", gateway.getId(), "config.cases",
                            "Gateway case has no outgoing edge: " + caseId);
            }
        }
    }

    private static void validateHandle(WorkflowEdge edge, WorkflowNode source,
            List<WorkflowValidationError> errors) {
        String handle = edge.getSourceHandle();
        boolean valid = switch (source.getType()) {
            case START, JOIN, USER_TASK, NOTIFICATION, SUB_PROCESS -> "next".equals(handle);
            case SYSTEM_TASK -> "success".equals(handle) || "error".equals(handle);
            case GATEWAY_EXCLUSIVE, GATEWAY_INCLUSIVE -> "default".equals(handle) || caseIds(source).contains(handle);
            case GATEWAY_PARALLEL -> caseIds(source).contains(handle);
            case END -> false;
        };
        if (!valid) add(errors, "INVALID_SOURCE_HANDLE", edge.getId(), "sourceHandle",
                "Invalid sourceHandle for " + source.getType());
    }

    private static void validateGatewayCases(WorkflowNode gateway, List<WorkflowValidationError> errors) {
        List<Map<String, Object>> cases = mapList(gateway.getConfig().get("cases"));
        Set<String> ids = new HashSet<>();
        for (Map<String, Object> gatewayCase : cases) {
            String caseId = stringValue(gatewayCase.get("id"));
            if (blank(caseId)) add(errors, "GATEWAY_CASE_ID_REQUIRED", gateway.getId(), "config.cases.id", "Case id is required");
            else if (!SAFE_KEY.matcher(caseId).matches())
                add(errors, "GATEWAY_CASE_ID_INVALID", gateway.getId(), "config.cases.id", "Case id contains unsupported characters");
            else if (!ids.add(caseId)) add(errors, "DUPLICATE_GATEWAY_CASE_ID", gateway.getId(), "config.cases.id", "Duplicate case id: " + caseId);
            List<Map<String, Object>> conditions = mapList(gatewayCase.get("conditions"));
            if (gateway.getType() == NodeType.GATEWAY_PARALLEL && !conditions.isEmpty())
                add(errors, "PARALLEL_CONDITION_NOT_ALLOWED", gateway.getId(), "config.cases.conditions", "Parallel branches cannot have conditions");
            if (gateway.getType() != NodeType.GATEWAY_PARALLEL && conditions.isEmpty())
                add(errors, "GATEWAY_CONDITION_REQUIRED", gateway.getId(), "config.cases.conditions", "Gateway case requires a condition");
            for (Map<String, Object> condition : conditions) {
                if (!"EQ".equals(stringValue(condition.get("operator"))))
                    add(errors, "CONDITION_OPERATOR_UNSUPPORTED", gateway.getId(), "config.cases.conditions.operator", "Only EQ is supported");
                if (blank(stringValue(condition.get("field"))))
                    add(errors, "CONDITION_FIELD_REQUIRED", gateway.getId(), "config.cases.conditions.field", "Condition field is required");
            }
        }
    }

    private static void validateJoinPairs(List<WorkflowNode> nodes, Map<String, WorkflowNode> byId,
            List<WorkflowValidationError> errors) {
        for (WorkflowNode gateway : nodes) {
            if (!isGateway(gateway.getType())) continue;
            String joinId = stringConfig(gateway, "joinNodeId");
            WorkflowNode join = byId.get(joinId);
            if (join == null || join.getType() != NodeType.JOIN) {
                add(errors, "GATEWAY_JOIN_NOT_FOUND", gateway.getId(), "config.joinNodeId", "Gateway must reference a JOIN node");
            } else if (!gateway.getId().equals(stringConfig(join, "gatewayNodeId"))) {
                add(errors, "GATEWAY_JOIN_MISMATCH", join.getId(), "config.gatewayNodeId", "Gateway and JOIN references must match");
            }
        }
    }

    private static void validateReachability(List<WorkflowNode> nodes,
            Map<String, List<WorkflowEdge>> outgoing, List<WorkflowValidationError> errors) {
        WorkflowNode start = nodes.stream().filter(node -> node.getType() == NodeType.START).findFirst().orElse(null);
        if (start == null) return;
        Set<String> reached = new HashSet<>();
        Deque<String> queue = new ArrayDeque<>();
        queue.add(start.getId());
        while (!queue.isEmpty()) {
            String current = queue.remove();
            if (reached.add(current)) outgoing.getOrDefault(current, List.of())
                    .forEach(edge -> queue.add(edge.getTargetNodeId()));
        }
        nodes.stream().filter(node -> !reached.contains(node.getId())).forEach(node ->
                add(errors, "UNREACHABLE_NODE", node.getId(), "id", "Node is not reachable from START"));
        if (nodes.stream().filter(node -> node.getType() == NodeType.END).noneMatch(node -> reached.contains(node.getId())))
            add(errors, "END_EVENT_REQUIRED", null, "nodes", "No END node is reachable from START");
    }

    private static Set<String> caseIds(WorkflowNode node) {
        return mapList(node.getConfig().get("cases")).stream()
                .map(item -> stringValue(item.get("id"))).filter(Objects::nonNull).collect(Collectors.toSet());
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> mapList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream().filter(Map.class::isInstance).map(item -> (Map<String, Object>) item).toList();
    }

    private static boolean isGateway(NodeType type) {
        return type == NodeType.GATEWAY_EXCLUSIVE || type == NodeType.GATEWAY_PARALLEL
                || type == NodeType.GATEWAY_INCLUSIVE;
    }

    private static String stringConfig(WorkflowNode node, String key) {
        return stringValue(node.getConfig().get(key));
    }

    private static String stringValue(Object value) {
        return value instanceof String text ? text : null;
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static <T> void duplicates(List<T> values, Function<T, String> key, String code,
            String field, List<WorkflowValidationError> errors) {
        Set<String> seen = new HashSet<>();
        for (T value : values) {
            String id = key.apply(value);
            if (!blank(id) && !seen.add(id)) add(errors, code, id, field, "Duplicate value: " + id);
        }
    }

    private static void add(List<WorkflowValidationError> errors, String code,
            String elementId, String field, String message) {
        errors.add(new WorkflowValidationError(code, elementId, field, message));
    }

    private static void throwIfAny(List<WorkflowValidationError> errors) {
        if (!errors.isEmpty()) throw new WorkflowValidationException(errors);
    }
}
