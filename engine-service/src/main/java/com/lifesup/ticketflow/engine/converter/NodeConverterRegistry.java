package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Registry tra cứu node converter theo loại node. */
@Component
public final class NodeConverterRegistry {
    private final Map<NodeType, NodeConverter> converters = new EnumMap<>(NodeType.class);

    public NodeConverterRegistry(List<NodeConverter> converters) {
        for (NodeConverter converter : converters) {
            if (this.converters.put(converter.supports(), converter) != null)
                throw new IllegalArgumentException("Duplicate converter for " + converter.supports());
        }
    }

    /** Lấy converter đã đăng ký hoặc báo lỗi cấu hình. */
    public NodeConverter get(NodeType type) {
        NodeConverter converter = converters.get(type);
        if (converter == null) throw new IllegalArgumentException("No node converter registered for " + type);
        return converter;
    }
}
