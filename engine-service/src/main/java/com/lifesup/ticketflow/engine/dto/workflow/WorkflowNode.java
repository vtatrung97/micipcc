package com.lifesup.ticketflow.engine.dto.workflow;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import java.util.Map;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Node nghiệp vụ đã tách khỏi cấu trúc render của Canvas. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkflowNode {
    String id;
    String key;
    NodeType type;
    String name;
    String description;
    Map<String, Object> config;
}
