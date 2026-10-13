package com.lifesup.ticketflow.engine.workflow;

import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Mô hình workflow chuẩn, độc lập với X6 và Flowable. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkflowDefinition {
    /** Mã quy trình, dùng làm id process BPMN và process definition key. */
    String processKey;
    String processName;
    List<WorkflowNode> nodes;
    List<WorkflowEdge> edges;

    public Optional<WorkflowNode> findNode(String nodeId) {
        return nodes.stream().filter(node -> node.getId() != null && node.getId().equals(nodeId)).findFirst();
    }

    /** Các edge đi ra từ node, theo thứ tự FE gửi. */
    public List<WorkflowEdge> outgoing(String nodeId) {
        return edges.stream().filter(edge -> nodeId.equals(edge.getSourceNodeId())).toList();
    }
}
