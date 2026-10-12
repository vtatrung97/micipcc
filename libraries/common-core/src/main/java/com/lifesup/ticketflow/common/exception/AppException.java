package com.lifesup.ticketflow.common.exception;

import lombok.Getter;

/**
 * Lỗi nghiệp vụ. Message mặc định là key i18n của mã lỗi;
 * truyền errorMessage (key i18n khác hoặc câu cụ thể) để thay message trả về client.
 * Dùng {@link #withArgs} khi message có tham số, VD "Trường {0} không phải JSON hợp lệ".
 */
@Getter
public class AppException extends RuntimeException {

    private static final Object[] NO_ARGS = new Object[0];

    private final transient BaseErrorCode errorCode;

    /** Tham số thay vào {0}, {1}... của message i18n. */
    private final transient Object[] args;

    public AppException(BaseErrorCode errorCode) {
        this(errorCode, errorCode.getMessage(), NO_ARGS, null);
    }

    public AppException(BaseErrorCode errorCode, String errorMessage) {
        this(errorCode, errorMessage, NO_ARGS, null);
    }

    public AppException(BaseErrorCode errorCode, Throwable cause) {
        this(errorCode, errorCode.getMessage(), NO_ARGS, cause);
    }

    private AppException(BaseErrorCode errorCode, String errorMessage, Object[] args, Throwable cause) {
        super(errorMessage, cause);
        this.errorCode = errorCode;
        this.args = args != null ? args : NO_ARGS;
    }

    /** Lỗi với message mặc định của mã lỗi, có tham số. */
    public static AppException withArgs(BaseErrorCode errorCode, Object... args) {
        return new AppException(errorCode, errorCode.getMessage(), args, null);
    }

    /** Lỗi với message mặc định của mã lỗi, có tham số và nguyên nhân gốc. */
    public static AppException withArgs(BaseErrorCode errorCode, Throwable cause, Object... args) {
        return new AppException(errorCode, errorCode.getMessage(), args, cause);
    }
}
