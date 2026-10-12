package com.lifesup.ticketflow.integration.common.enums;

/**
 * Trạng thái của API (operation). Action bên core-service trỏ tới operation.id cụ thể nên bản đã ACTIVE
 * không được sửa nữa (muốn đổi thì tạo version mới ở trạng thái DRAFT), tránh làm đổi hành vi Flow đang chạy.
 */
public enum OperationStatus {
    /** Đang soạn: sửa được, chưa được chọn trong Flow. */
    DRAFT,
    /** Được phép chọn và gọi trong Flow, không sửa được nữa. */
    ACTIVE,
    /** Tạm ngưng, không sửa được. */
    INACTIVE
}
