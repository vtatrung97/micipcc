package com.lifesup.ticketflow.engine.parser;

import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;

/** Parser chuyển raw Canvas JSON thành DTO. */
public interface CanvasDocumentParser {
    /** Parse JSON và trả lỗi validation chuẩn nếu JSON không hợp lệ. */
    CanvasDocument parse(String modelJson);
}
