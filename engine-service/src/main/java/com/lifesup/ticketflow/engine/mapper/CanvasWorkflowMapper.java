package com.lifesup.ticketflow.engine.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasEdge;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasNode;
import com.lifesup.ticketflow.engine.dto.canvas.model.EndNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.JoinNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.NodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.NotificationNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.StartNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.SystemTaskNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.UserTaskNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.validation.ValidationCode;
import com.lifesup.ticketflow.engine.validation.ValidationErrors;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Chuyển Canvas DTO sang mô hình workflow chuẩn: bỏ dữ liệu hiển thị (position, viewport) và parse cấu hình
 * node đúng kiểu.
 *
 * <p>Cấu hình được parse strict (field lạ, sai kiểu, enum không hỗ trợ đều là lỗi) để FE đổi hợp đồng thì
 * phát hiện ngay, không mất dữ liệu im lặng.
 */
@Component
public final class CanvasWorkflowMapper {
    private final ObjectMapper strictMapper;

    public CanvasWorkflowMapper(ObjectMapper objectMapper) {
        this.strictMapper = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

    /** Ánh xạ toàn bộ document; mọi lỗi cấu trúc / cấu hình được gom và ném một lần. */
    public WorkflowDefinition map(CanvasDocument document, String processKey, String processName) {
        ValidationErrors errors = new ValidationErrors();
        if (document == null || document.getNodes() == null || document.getEdges() == null) {
            errors.add(ValidationCode.CANVAS_JSON_INVALID, null, "flowJson", "flowJson phải có nodes và edges");
            errors.throwIfAny();
        }
        List<WorkflowNode> nodes = mapNodes(document.getNodes(), errors);
        List<WorkflowEdge> edges = mapEdges(document.getEdges());
        errors.throwIfAny();
        return new WorkflowDefinition(processKey, processName, nodes, edges);
    }

    private List<WorkflowNode> mapNodes(List<CanvasNode> canvasNodes, ValidationErrors errors) {
        List<WorkflowNode> nodes = new ArrayList<>();
        for (CanvasNode canvasNode : canvasNodes) {
            if (canvasNode == null) {
                continue;
            }
            NodeType type = NodeType.fromCanvasName(canvasNode.getType()).orElse(null);
            if (type == null) {
                errors.add(ValidationCode.NODE_TYPE_UNSUPPORTED, canvasNode.getId(), "type",
                        "Loại node không được hỗ trợ: " + canvasNode.getType());
                continue;
            }
            NodeConfig config = parseConfig(canvasNode, type, errors);
            if (config != null) {
                nodes.add(new WorkflowNode(canvasNode.getId(), canvasNode.getKey(), type,
                        canvasNode.getName(), canvasNode.getDescription(), config));
            }
        }
        return List.copyOf(nodes);
    }

    /** Parse config theo class của loại node; lỗi trả về null và ghi lỗi kèm đường dẫn field. */
    private NodeConfig parseConfig(CanvasNode node, NodeType type, ValidationErrors errors) {
        JsonNode raw = node.getConfig() == null || node.getConfig().isNull()
                ? JsonNodeFactory.instance.objectNode()
                : node.getConfig();
        if (!raw.isObject()) {
            errors.add(ValidationCode.NODE_CONFIG_INVALID, node.getId(), "config", "config phải là object");
            return null;
        }
        try {
            return strictMapper.treeToValue(raw, configType(type));
        } catch (JsonMappingException exception) {
            errors.add(ValidationCode.NODE_CONFIG_INVALID, node.getId(), configPath(exception), describe(exception));
            return null;
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            errors.add(ValidationCode.NODE_CONFIG_INVALID, node.getId(), "config", "Cấu hình không đúng định dạng");
            return null;
        }
    }

    private static List<WorkflowEdge> mapEdges(List<CanvasEdge> canvasEdges) {
        return canvasEdges.stream()
                .filter(Objects::nonNull)
                .map(edge -> new WorkflowEdge(edge.getId(), edge.getSource(), edge.getSourceHandle(), edge.getTarget()))
                .toList();
    }

    private static Class<? extends NodeConfig> configType(NodeType type) {
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

    /** Đường dẫn field bị lỗi, VD config.cases[0].conditions[1].operator. */
    private static String configPath(JsonMappingException exception) {
        String path = exception.getPath().stream()
                .map(reference -> reference.getFieldName() != null
                        ? "." + reference.getFieldName()
                        : "[" + reference.getIndex() + "]")
                .collect(Collectors.joining());
        return "config" + path;
    }

    private static String describe(JsonMappingException exception) {
        if (exception instanceof UnrecognizedPropertyException unrecognized) {
            return "Trường không được hỗ trợ: " + unrecognized.getPropertyName();
        }
        if (exception instanceof InvalidFormatException invalidFormat) {
            return "Giá trị không hợp lệ: " + invalidFormat.getValue();
        }
        return "Cấu hình không đúng kiểu dữ liệu";
    }
}
