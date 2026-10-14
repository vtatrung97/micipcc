package com.lifesup.ticketflow.engine.parser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import com.lifesup.ticketflow.engine.validation.ValidationCode;
import com.lifesup.ticketflow.engine.validation.ValidationErrors;
import org.springframework.stereotype.Component;

/**
 * Parse flowJson bằng Jackson. Ở mức document / node / edge bỏ qua field hiển thị (viewport, style...);
 * cấu hình node được parse strict ở CanvasWorkflowMapper. Không log nội dung payload.
 */
@Component
public final class JacksonCanvasDocumentParser implements CanvasDocumentParser {
    private final ObjectMapper objectMapper;

    public JacksonCanvasDocumentParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public CanvasDocument parse(String modelJson) {
        if (modelJson == null || modelJson.isBlank()) {
            throw invalidJson("flowJson không được để trống");
        }
        try {
            return objectMapper.readValue(modelJson, CanvasDocument.class);
        } catch (JsonProcessingException exception) {
            throw invalidJson("flowJson không phải JSON canvas hợp lệ");
        }
    }

    private static WorkflowValidationException invalidJson(String message) {
        ValidationErrors errors = new ValidationErrors();
        errors.add(ValidationCode.CANVAS_JSON_INVALID, null, "flowJson", message);
        return new WorkflowValidationException(errors.asList());
    }
}
