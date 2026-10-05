package com.lifesup.ticketflow.engine.dto.workflow;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Luồng chuyển tiếp chuẩn giữa hai workflow node. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkflowEdge {
    String id;
    String sourceNodeId;
    String sourceHandle;
    String targetNodeId;
    String name;
}
