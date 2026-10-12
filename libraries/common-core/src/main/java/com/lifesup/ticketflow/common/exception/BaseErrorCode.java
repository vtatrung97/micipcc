package com.lifesup.ticketflow.common.exception;

import org.springframework.http.HttpStatusCode;

/**
 * Hợp đồng chung của mã lỗi. {@link ErrorCode} chứa các lỗi dùng chung (1xxx) và lỗi của core-service (2xxx);
 * mỗi service khác tự khai báo enum riêng implement interface này (VD integration-service: 3xxx)
 * để không phải sửa thư viện mỗi khi thêm lỗi nghiệp vụ.
 */
public interface BaseErrorCode {

    /** Mã số trả về trong trường {@code code} của ApiResponse, duy nhất trên toàn hệ thống. */
    int getCode();

    /** Key message trong i18n/messages*.properties của service. */
    String getMessage();

    HttpStatusCode getStatusCode();
}
