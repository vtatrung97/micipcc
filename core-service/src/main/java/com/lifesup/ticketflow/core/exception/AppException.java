package com.lifesup.ticketflow.core.exception;

import lombok.Getter;

/**
 * Lỗi nghiệp vụ. Message mặc định là key i18n của {@link ErrorCode};
 * truyền errorMessage (key i18n khác hoặc câu cụ thể) để thay message trả về client.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
