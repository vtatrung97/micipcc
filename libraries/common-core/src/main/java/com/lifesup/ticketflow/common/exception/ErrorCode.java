package com.lifesup.ticketflow.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Mã lỗi dùng chung: mã số, key message trong i18n/messages*.properties và HTTP status.
 */
@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "err.code.UNCATEGORIZED_EXCEPTION", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1000, "err.code.INVALID_REQUEST", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1001, "err.code.UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(1002, "err.code.ACCESS_DENIED", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1003, "err.code.INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED(1004, "err.code.ACCOUNT_DISABLED", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_READY(1005, "err.code.ACCOUNT_NOT_READY", HttpStatus.FORBIDDEN),
    INVALID_REFRESH_TOKEN(1006, "err.code.INVALID_REFRESH_TOKEN", HttpStatus.UNAUTHORIZED),
    INVALID_API_KEY(1007, "err.code.INVALID_API_KEY", HttpStatus.UNAUTHORIZED),
    KEYCLOAK_UNAVAILABLE(1008, "err.code.KEYCLOAK_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE),
    KEYCLOAK_CONFIGURATION_ERROR(1009, "err.code.KEYCLOAK_CONFIGURATION_ERROR", HttpStatus.INTERNAL_SERVER_ERROR),
    REDIS_UNAVAILABLE(1010, "err.code.REDIS_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE),
    RESOURCE_NOT_FOUND(1011, "err.code.RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(1012, "err.code.METHOD_NOT_ALLOWED", HttpStatus.METHOD_NOT_ALLOWED),
    MALFORMED_REQUEST(1013, "err.code.MALFORMED_REQUEST", HttpStatus.BAD_REQUEST),
    SERVICE_UNHEALTHY(1014, "err.code.SERVICE_UNHEALTHY", HttpStatus.SERVICE_UNAVAILABLE),
    DATA_CONFLICT(1015, "err.code.DATA_CONFLICT", HttpStatus.CONFLICT),

    // Ticket call flow
    TICKET_CALL_FLOW_NOT_FOUND(2001, "err.code.TICKET_CALL_FLOW_NOT_FOUND", HttpStatus.NOT_FOUND),
    TICKET_CALL_FLOW_CODE_EXISTED(2002, "err.code.TICKET_CALL_FLOW_CODE_EXISTED", HttpStatus.CONFLICT),
    FLOW_JSON_INVALID(2003, "err.code.FLOW_JSON_INVALID", HttpStatus.BAD_REQUEST),
    FLOW_JSON_TOO_LARGE(2004, "err.code.FLOW_JSON_TOO_LARGE", HttpStatus.PAYLOAD_TOO_LARGE);

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    /** Key message trong i18n/messages*.properties. */
    private final String message;
    private final HttpStatusCode statusCode;
}
