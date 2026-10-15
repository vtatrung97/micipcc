package com.lifesup.ticketflow.engine.workflow.model;

import java.util.Optional;

/** Các loại node Canvas được converter hỗ trợ. Tên enum trùng giá trị {@code type} FE gửi. */
public enum NodeType {
    START,
    GATEWAY_EXCLUSIVE,
    GATEWAY_PARALLEL,
    GATEWAY_INCLUSIVE,
    JOIN,
    USER_TASK,
    SYSTEM_TASK,
    NOTIFICATION,
    SUB_PROCESS,
    END;

    /** Tìm loại node từ tên type của Canvas. */
    public static Optional<NodeType> fromCanvasName(String value) {
        if (value == null) return Optional.empty();
        try {
            return Optional.of(NodeType.valueOf(value));
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    public boolean isGateway() {
        return this == GATEWAY_EXCLUSIVE || this == GATEWAY_PARALLEL || this == GATEWAY_INCLUSIVE;
    }

    /** Gateway rẽ nhánh theo điều kiện (exclusive / inclusive), khác parallel chạy mọi nhánh. */
    public boolean isConditionalGateway() {
        return this == GATEWAY_EXCLUSIVE || this == GATEWAY_INCLUSIVE;
    }
}
