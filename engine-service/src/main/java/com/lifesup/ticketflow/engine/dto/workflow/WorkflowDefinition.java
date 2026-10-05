package com.lifesup.ticketflow.engine.dto.workflow;

import java.util.List;
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
    String processKey;
    String processName;
    List<WorkflowNode> nodes;
    List<WorkflowEdge> edges;
}
