package com.lifesup.ticketflow.engine.workflow.canvas;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.lifesup.ticketflow.engine.workflow.handler.NodeHandlers;
import com.lifesup.ticketflow.engine.workflow.model.NodeConfig;
import com.lifesup.ticketflow.engine.workflow.model.NodeType;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowDefinition;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowEdge;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationErrors;
import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Đọc flowJson thành WorkflowDefinition: bỏ dữ liệu hiển thị, parse cấu hình node theo class của loại node.
 * Cấu hình được parse strict (field lạ, sai kiểu, giá trị enum không hỗ trợ đều là lỗi) để FE đổi hợp đồng thì
 * phát hiện ngay. Mọi lỗi được gom và ném một lần.
 */
@Component
public class CanvasWorkflowMapper {
    private final ObjectMapper objectMapper;
    private final ObjectMapper strictMapper;
    private final NodeHandlers handlers;

    public CanvasWorkflowMapper(ObjectMapper objectMapper, NodeHandlers handlers) {
        this.objectMapper = objectMapper;
        this.strictMapper = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        this.handlers = handlers;
    }

    public WorkflowDefinition map(String flowJson, String processKey, String processName) {
        // Parse Json -> CanvasDocument
        CanvasDocument document = parse(flowJson);

        // Collect errors
        ValidationErrors errors = new ValidationErrors();
        List<WorkflowNode> nodes = new ArrayList<>();

        // Handle CanvasDocument -> WorkflowNode
        for (CanvasDocument.Node canvasNode : document.getNodes()) {
            if (canvasNode != null) {
                toWorkflowNode(canvasNode, errors).ifPresent(nodes::add);
            }
        }

        // Handle CanvasDocument -> WorkflowEdge
        List<WorkflowEdge> edges = document.getEdges().stream()
                .filter(Objects::nonNull)
                .map(edge -> new WorkflowEdge(edge.getId(), edge.getSource(), edge.getSourceHandle(), edge.getTarget()))
                .toList();
        errors.throwIfAny();

        // Build & return WorkflowDefinition (from WorkflowNode and WorkflowEdge)
        return new WorkflowDefinition(processKey, processName, List.copyOf(nodes), edges);
    }

    private CanvasDocument parse(String flowJson) {
        if (flowJson == null || flowJson.isBlank()) {
            throw invalidJson("flowJson không được để trống");
        }
        CanvasDocument document;
        try {
            document = objectMapper.readValue(flowJson, CanvasDocument.class);
        } catch (JsonProcessingException exception) {
            throw invalidJson("flowJson không phải JSON canvas hợp lệ");
        }
        if (document == null || document.getNodes() == null || document.getEdges() == null) {
            throw invalidJson("flowJson phải có nodes và edges");
        }
        return document;
    }

    private Optional<WorkflowNode> toWorkflowNode(CanvasDocument.Node node, ValidationErrors errors) {
        NodeType type = NodeType.fromCanvasName(node.getType()).orElse(null);
        if (type == null) {
            errors.add(ValidationCode.NODE_TYPE_UNSUPPORTED, node.getId(), "type",
                    "Loại node không được hỗ trợ: " + node.getType());
            return Optional.empty();
        }
        JsonNode raw = node.getConfig() == null || node.getConfig().isNull()
                ? JsonNodeFactory.instance.objectNode()
                : node.getConfig();
        try {
            NodeConfig config = strictMapper.treeToValue(raw, handlers.configType(type));

            // Return WorkflowNode
            return Optional.of(new WorkflowNode(node.getId(), node.getKey(), type, node.getName(),
                    node.getDescription(), config));
        } catch (JsonMappingException exception) {
            errors.add(ValidationCode.NODE_CONFIG_INVALID, node.getId(), configPath(exception), describe(exception));
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            errors.add(ValidationCode.NODE_CONFIG_INVALID, node.getId(), "config", "Cấu hình không đúng định dạng");
        }
        return Optional.empty();
    }

    private static WorkflowValidationException invalidJson(String message) {
        ValidationErrors errors = new ValidationErrors();
        errors.add(ValidationCode.CANVAS_JSON_INVALID, null, "flowJson", message);
        return errors.toException();
    }

    /** Đường dẫn field lỗi, VD config.cases[0].conditions[1].operator. */
    private static String configPath(JsonMappingException exception) {
        return "config" + exception.getPath().stream()
                .map(reference -> reference.getFieldName() != null
                        ? "." + reference.getFieldName()
                        : "[" + reference.getIndex() + "]")
                .collect(Collectors.joining());
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
