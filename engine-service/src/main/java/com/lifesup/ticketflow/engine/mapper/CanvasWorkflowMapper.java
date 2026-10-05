package com.lifesup.ticketflow.engine.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasEdge;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasNode;
import com.lifesup.ticketflow.engine.dto.canvas.model.*;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowValidationError;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Chuyển Canvas DTO sang canonical workflow model. */
@Component
public final class CanvasWorkflowMapper {
    private static final TypeReference<Map<String, Object>> CONFIG_MAP = new TypeReference<>() { };
    private final ObjectMapper objectMapper;

    public CanvasWorkflowMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** Loại bỏ dữ liệu hiển thị và chuyển config node về cấu trúc canonical. */
    public WorkflowDefinition map(CanvasDocument document, String processKey, String processName) {
        List<WorkflowValidationError> errors = new ArrayList<>();
        List<WorkflowNode> nodes = mapNodes(document.getNodes(), errors);
        List<WorkflowEdge> edges = mapEdges(document.getEdges());
        enrichJoinTypes(nodes, errors);
        if (!errors.isEmpty()) throw new WorkflowValidationException(errors);
        return new WorkflowDefinition(processKey, processName, nodes, edges);
    }

    /** Map từng Canvas node và typed config tương ứng. */
    private List<WorkflowNode> mapNodes(List<CanvasNode> canvasNodes, List<WorkflowValidationError> errors) {
        if (canvasNodes == null) return List.of();
        List<WorkflowNode> nodes = new ArrayList<>();
        for (CanvasNode canvasNode : canvasNodes) {
            if (canvasNode == null) continue;
            NodeType type = NodeType.fromCanvasName(canvasNode.getType()).orElse(null);
            if (type == null) {
                errors.add(error("NODE_TYPE_UNSUPPORTED", canvasNode.getId(), "type",
                        "Unsupported node type: " + canvasNode.getType()));
                continue;
            }
            try {
                Object typedConfig = objectMapper.convertValue(configOrEmpty(canvasNode.getConfig()), configType(type));
                Map<String, Object> config = objectMapper.convertValue(typedConfig, CONFIG_MAP);
                nodes.add(new WorkflowNode(canvasNode.getId(), canvasNode.getKey(), type,
                        canvasNode.getName(), canvasNode.getDescription(), config));
            } catch (IllegalArgumentException exception) {
                errors.add(error("NODE_CONFIG_INVALID", canvasNode.getId(), "config", "Invalid node config"));
            }
        }
        return List.copyOf(nodes);
    }

    /** Map edge mới; semantics của sourceHandle được xử lý khi dựng BPMN. */
    private static List<WorkflowEdge> mapEdges(List<CanvasEdge> canvasEdges) {
        if (canvasEdges == null) return List.of();
        return canvasEdges.stream().filter(java.util.Objects::nonNull)
                .map(edge -> new WorkflowEdge(edge.getId(), edge.getSource(), edge.getSourceHandle(),
                        edge.getTarget(), null))
                .toList();
    }

    /** Gắn loại gateway cha vào JOIN để chọn đúng BPMN gateway khi convert. */
    private static void enrichJoinTypes(List<WorkflowNode> nodes, List<WorkflowValidationError> errors) {
        Map<String, WorkflowNode> byId = nodes.stream()
                .filter(node -> node.getId() != null)
                .collect(Collectors.toMap(WorkflowNode::getId, Function.identity(), (first, ignored) -> first));
        for (WorkflowNode join : nodes) {
            if (join.getType() != NodeType.JOIN) continue;
            String gatewayNodeId = stringConfig(join, "gatewayNodeId");
            WorkflowNode gateway = byId.get(gatewayNodeId);
            if (gateway == null || !isGateway(gateway.getType())) {
                errors.add(error("JOIN_GATEWAY_NOT_FOUND", join.getId(), "config.gatewayNodeId",
                        "JOIN must reference an existing gateway"));
                continue;
            }
            join.getConfig().put("gatewayType", gateway.getType().name());
        }
    }

    /** Trả class config tương ứng với node type. */
    private static Class<?> configType(NodeType type) {
        return switch (type) {
            case START -> StartNodeConfig.class;
            case GATEWAY_EXCLUSIVE, GATEWAY_PARALLEL, GATEWAY_INCLUSIVE -> GatewayNodeConfig.class;
            case JOIN -> JoinNodeConfig.class;
            case USER_TASK -> UserTaskNodeConfig.class;
            case SYSTEM_TASK -> SystemTaskNodeConfig.class;
            case NOTIFICATION -> NotificationNodeConfig.class;
            case SUB_PROCESS -> SubProcessNodeConfig.class;
            case END -> EndNodeConfig.class;
        };
    }

    private static JsonNode configOrEmpty(JsonNode config) {
        return config == null || config.isNull()
                ? com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode() : config;
    }

    private static boolean isGateway(NodeType type) {
        return type == NodeType.GATEWAY_EXCLUSIVE || type == NodeType.GATEWAY_PARALLEL
                || type == NodeType.GATEWAY_INCLUSIVE;
    }

    private static String stringConfig(WorkflowNode node, String key) {
        Object value = node.getConfig().get(key);
        return value instanceof String text ? text : null;
    }

    private static WorkflowValidationError error(String code, String id, String field, String message) {
        return new WorkflowValidationError(code, id, field, message);
    }
}
