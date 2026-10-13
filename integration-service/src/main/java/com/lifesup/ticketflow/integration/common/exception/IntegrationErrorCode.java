package com.lifesup.ticketflow.integration.common.exception;

import com.lifesup.ticketflow.common.exception.BaseErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Mã lỗi riêng của integration-service, dải 3xxx (1xxx dùng chung, 2xxx core-service).
 * Message là key trong i18n/messages*.properties; mã có {0} dùng AppException.withArgs(code, tenTruong).
 */
@Getter
public enum IntegrationErrorCode implements BaseErrorCode {

    // External system 300x
    EXTERNAL_SYSTEM_NOT_FOUND(3001, HttpStatus.NOT_FOUND),
    EXTERNAL_SYSTEM_CODE_EXISTED(3002, HttpStatus.CONFLICT),
    EXTERNAL_SYSTEM_HAS_CONNECTIONS(3003, HttpStatus.CONFLICT),
    EXTERNAL_SYSTEM_INACTIVE(3004, HttpStatus.BAD_REQUEST),

    // Connection 301x
    CONNECTION_NOT_FOUND(3011, HttpStatus.NOT_FOUND),
    CONNECTION_CODE_EXISTED(3012, HttpStatus.CONFLICT),
    CONNECTION_HAS_OPERATIONS(3013, HttpStatus.CONFLICT),
    CONNECTION_INACTIVE(3014, HttpStatus.BAD_REQUEST),
    CONNECTION_BASE_URL_INVALID(3015, HttpStatus.BAD_REQUEST),
    CONNECTION_AUTH_CONFIG_INVALID(3016, HttpStatus.BAD_REQUEST),

    // Operation 302x
    OPERATION_NOT_FOUND(3021, HttpStatus.NOT_FOUND),
    OPERATION_CODE_EXISTED(3022, HttpStatus.CONFLICT),
    OPERATION_NOT_EDITABLE(3023, HttpStatus.BAD_REQUEST),
    OPERATION_STATUS_TRANSITION_INVALID(3024, HttpStatus.BAD_REQUEST),
    OPERATION_DRAFT_EXISTED(3025, HttpStatus.CONFLICT),
    OPERATION_MAPPING_INVALID(3028, HttpStatus.BAD_REQUEST),
    OPERATION_PATH_INVALID(3029, HttpStatus.BAD_REQUEST),

    // Execution log 303x
    EXECUTION_LOG_NOT_FOUND(3031, HttpStatus.NOT_FOUND),
    EXECUTION_LOG_TIME_RANGE_INVALID(3032, HttpStatus.BAD_REQUEST),

    // Operation (tiếp) 304x
    OPERATION_NOT_DELETABLE(3040, HttpStatus.BAD_REQUEST),
    OPERATION_HEADER_NOT_ALLOWED(3041, HttpStatus.BAD_REQUEST),
    OPERATION_INPUT_PARAMS_INVALID(3043, HttpStatus.BAD_REQUEST),
    OPERATION_OUTPUT_PARAMS_INVALID(3044, HttpStatus.BAD_REQUEST);

    private final int code;
    /** Key i18n: err.code.&lt;TÊN_ENUM&gt;. */
    private final String message;
    private final HttpStatusCode statusCode;

    IntegrationErrorCode(int code, HttpStatusCode statusCode) {
        this.code = code;
        this.message = "err.code." + name();
        this.statusCode = statusCode;
    }
}
