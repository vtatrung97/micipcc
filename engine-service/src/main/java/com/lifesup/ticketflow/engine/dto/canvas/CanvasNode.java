package com.lifesup.ticketflow.engine.dto.canvas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một node trong FlowDefinition của FE. */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CanvasNode {
    String id;
    String type;
    String name;
    String key;
    String description;
    CanvasPosition position;
    JsonNode config;
}
