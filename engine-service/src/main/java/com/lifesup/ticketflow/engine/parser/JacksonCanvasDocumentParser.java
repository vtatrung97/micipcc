package com.lifesup.ticketflow.engine.parser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowValidationError;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import java.util.List;
import org.springframework.stereotype.Component;

/** Canvas parser sử dụng Jackson và bỏ qua field render không cần thiết. */
@Component
public final class JacksonCanvasDocumentParser implements CanvasDocumentParser {
    private final ObjectMapper objectMapper;

    public JacksonCanvasDocumentParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    /** Parse raw JSON mà không log nội dung payload. */
    public CanvasDocument parse(String modelJson) {
        if (modelJson == null || modelJson.isBlank()) {
            throw invalidJson("modelJson must not be blank");
        }
        try {
            return objectMapper.readValue(modelJson, CanvasDocument.class);
        } catch (JsonProcessingException exception) {
            throw invalidJson("modelJson is not valid Canvas JSON");
        }
    }

    /** Tạo exception có error code thống nhất cho lỗi JSON. */
    private WorkflowValidationException invalidJson(String message) {
        return new WorkflowValidationException(List.of(
                new WorkflowValidationError("CANVAS_JSON_INVALID", null, "modelJson", message)));
    }
}
