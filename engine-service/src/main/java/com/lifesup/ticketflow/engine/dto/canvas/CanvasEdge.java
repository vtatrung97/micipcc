package com.lifesup.ticketflow.engine.dto.canvas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Dây nối giữa hai Canvas node. */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CanvasEdge {
    String id;
    String source;
    String sourceHandle;
    String target;
}
