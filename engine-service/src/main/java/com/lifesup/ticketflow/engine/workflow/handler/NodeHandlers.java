package com.lifesup.ticketflow.engine.workflow.handler;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import com.lifesup.ticketflow.engine.workflow.model.NodeConfig;
import com.lifesup.ticketflow.engine.workflow.model.NodeType;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import org.springframework.stereotype.Component;

/** Tra handler theo loại node. Thiếu hoặc trùng handler là lỗi cấu hình, báo ngay khi khởi động. */
@Component
public class NodeHandlers {
    private final Map<NodeType, NodeHandler<?>> handlers = new EnumMap<>(NodeType.class);

    public NodeHandlers(List<NodeHandler<?>> handlers) {
        for (NodeHandler<?> handler : handlers) {
            for (NodeType type : handler.types()) {
                if (this.handlers.put(type, handler) != null) {
                    throw new IllegalStateException("Duplicate node handler for " + type);
                }
            }
        }
        for (NodeType type : NodeType.values()) {
            if (!this.handlers.containsKey(type)) {
                throw new IllegalStateException("No node handler for " + type);
            }
        }
    }

    /** Class cấu hình của loại node, dùng khi parse JSON. */
    public Class<? extends NodeConfig> configType(NodeType type) {
        return handlers.get(type).configType();
    }

    /**
     * Handler của node. Cấu hình của node luôn là đúng class của handler (mapper parse theo {@link #configType}),
     * nên ép kiểu ở đây an toàn và là chỗ ép kiểu duy nhất.
     */
    @SuppressWarnings("unchecked")
    public NodeHandler<NodeConfig> of(WorkflowNode node) {
        return (NodeHandler<NodeConfig>) handlers.get(node.getType());
    }
}
