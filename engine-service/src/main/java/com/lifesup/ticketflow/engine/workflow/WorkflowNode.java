package com.lifesup.ticketflow.engine.workflow;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Node đã tách khỏi dữ liệu hiển thị của Canvas; cấu hình đã parse đúng class của loại node. */
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
    NodeConfig config;

    /** Cấu hình theo đúng class mong đợi (VD lấy cấu hình của node khác khi kiểm tra / chuyển BPMN). */
    public <T extends NodeConfig> T config(Class<T> type) {
        if (!type.isInstance(config)) {
            throw new IllegalStateException("Node " + id + " is not configured as " + type.getSimpleName());
        }
        return type.cast(config);
    }
}
