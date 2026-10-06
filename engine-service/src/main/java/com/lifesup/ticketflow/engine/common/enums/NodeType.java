package com.lifesup.ticketflow.engine.common.enums;

import java.util.Optional;

/** Các loại node Canvas được converter hỗ trợ. */
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
}
