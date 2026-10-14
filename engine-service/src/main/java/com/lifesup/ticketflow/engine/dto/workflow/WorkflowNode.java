package com.lifesup.ticketflow.engine.dto.workflow;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.model.NodeConfig;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Node nghiệp vụ đã tách khỏi dữ liệu hiển thị của Canvas, cấu hình đã parse đúng kiểu. */
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

    /** Cấu hình theo đúng class mong đợi; sai loại là lỗi lập trình (mapper đã gán class theo type). */
    public <T extends NodeConfig> T config(Class<T> type) {
        if (!type.isInstance(config)) {
            throw new IllegalStateException("Node " + id + " has config " + describe(config) + ", expected " + type.getSimpleName());
        }
        return type.cast(config);
    }

    private static String describe(NodeConfig config) {
        return config == null ? "null" : config.getClass().getSimpleName();
    }
}
