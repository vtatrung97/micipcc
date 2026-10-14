package com.lifesup.ticketflow.engine.parser;

import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;

/** Parser chuyển flowJson thô thành DTO. */
public interface CanvasDocumentParser {
    /** Parse JSON; JSON rỗng hoặc sai cú pháp ném WorkflowValidationException mã CANVAS_JSON_INVALID. */
    CanvasDocument parse(String modelJson);
}
