package com.lifesup.ticketflow.engine.dto.canvas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Dữ liệu gốc của một canvas workflow do FE gửi lên. */
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CanvasDocument {
    List<CanvasNode> nodes;
    List<CanvasEdge> edges;
    CanvasViewport viewport;
}
