package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Tra converter theo loại node; thiếu hoặc trùng converter là lỗi cấu hình khi khởi động. */
@Component
public final class NodeConverterRegistry {
    private final Map<NodeType, NodeConverter> converters = new EnumMap<>(NodeType.class);

    public NodeConverterRegistry(List<NodeConverter> converters) {
        for (NodeConverter converter : converters) {
            if (this.converters.put(converter.supports(), converter) != null) {
                throw new IllegalArgumentException("Duplicate converter for " + converter.supports());
            }
        }
        for (NodeType type : NodeType.values()) {
            if (!this.converters.containsKey(type)) {
                throw new IllegalArgumentException("No node converter registered for " + type);
            }
        }
    }

    public NodeConverter get(NodeType type) {
        return converters.get(type);
    }
}
