package com.lifesup.ticketflow.integration.common.enums;

/** Trạng thái cấu hình tích hợp. Hệ thống và kết nối chỉ dùng ACTIVE / INACTIVE; operation có thêm DRAFT. */
public enum IntegrationStatus {
    /** Đang soạn, chưa được chọn trong Flow. */
    DRAFT,
    /** Được phép dùng trong Flow. */
    ACTIVE,
    /** Tạm ngưng. */
    INACTIVE
}
