package com.lifesup.ticketflow.engine.workflow;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * flowJson do FE gửi. Chỉ giữ phần engine dùng; dữ liệu hiển thị (position, viewport...) bị bỏ qua.
 * {@code config} giữ dạng JSON thô, CanvasWorkflowMapper parse theo loại node.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CanvasDocument {
    List<Node> nodes;
    List<Edge> edges;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Node {
        String id;
        String type;
        String name;
        String key;
        String description;
        JsonNode config;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Edge {
        String id;
        String source;
        String sourceHandle;
        String target;
    }
}
