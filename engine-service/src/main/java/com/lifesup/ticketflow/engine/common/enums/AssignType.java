package com.lifesup.ticketflow.engine.common.enums;

/** Cách giao USER_TASK. */
public enum AssignType {
    /** Giao cho nhóm / danh sách người, người xử lý tự nhận việc. */
    MANUAL,
    /** Hệ thống tự chọn một người theo {@link AssignStrategy}. */
    AUTO
}
