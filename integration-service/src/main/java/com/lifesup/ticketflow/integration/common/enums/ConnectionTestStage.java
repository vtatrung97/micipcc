package com.lifesup.ticketflow.integration.common.enums;

/** Bước kiểm tra kết nối bị lỗi, theo thứ tự thực hiện. */
public enum ConnectionTestStage {
    /** Phân giải tên miền. */
    DNS,
    /** Mở kết nối TCP. */
    TCP,
    /** Bắt tay TLS (https). */
    TLS,
    /** Gửi request HTTP nhẹ. */
    HTTP
}
