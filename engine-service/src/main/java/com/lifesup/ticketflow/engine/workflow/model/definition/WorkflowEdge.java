package com.lifesup.ticketflow.engine.workflow.model.definition;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Luồng chuyển tiếp giữa hai node; {@code sourceHandle} là cổng ra của node nguồn (xem SourceHandles). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkflowEdge {
    String id;
    String sourceNodeId;
    String sourceHandle;
    String targetNodeId;
}
