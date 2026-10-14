package com.lifesup.ticketflow.engine.exception;

import com.lifesup.ticketflow.common.exception.BaseErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Mã lỗi riêng của engine-service, dải 4xxx (1xxx dùng chung, 2xxx core-service, 3xxx integration-service).
 * Message là key trong i18n/messages*.properties.
 */
@Getter
public enum EngineErrorCode implements BaseErrorCode {

    // Định nghĩa quy trình 400x
    WORKFLOW_INVALID(4000, HttpStatus.BAD_REQUEST),
    PROCESS_DEFINITION_NOT_FOUND(4001, HttpStatus.NOT_FOUND),
    DEPLOYMENT_FAILED(4002, HttpStatus.INTERNAL_SERVER_ERROR),

    // Instance 401x
    PROCESS_INSTANCE_NOT_FOUND(4011, HttpStatus.NOT_FOUND),
    PROCESS_EXECUTION_FAILED(4012, HttpStatus.UNPROCESSABLE_ENTITY),

    // Task 402x
    TASK_NOT_FOUND(4021, HttpStatus.NOT_FOUND),
    TASK_NOT_ASSIGNED_TO_USER(4022, HttpStatus.CONFLICT),
    TASK_ALREADY_CLAIMED(4023, HttpStatus.CONFLICT);

    private final int code;
    /** Key i18n: err.code.&lt;TÊN_ENUM&gt;. */
    private final String message;
    private final HttpStatusCode statusCode;

    EngineErrorCode(int code, HttpStatusCode statusCode) {
        this.code = code;
        this.message = "err.code." + name();
        this.statusCode = statusCode;
    }
}
