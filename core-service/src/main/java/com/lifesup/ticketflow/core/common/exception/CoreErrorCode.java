package com.lifesup.ticketflow.core.common.exception;

import com.lifesup.ticketflow.common.exception.BaseErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Mã lỗi riêng của core-service, dải 2xxx (1xxx dùng chung ở common-core, 3xxx integration-service).
 * Message là key err.code.&lt;TÊN_ENUM&gt; trong i18n/messages*.properties.
 */
@Getter
public enum CoreErrorCode implements BaseErrorCode {

    // Ticket call flow
    TICKET_CALL_FLOW_NOT_FOUND(2001, HttpStatus.NOT_FOUND),
    TICKET_CALL_FLOW_CODE_EXISTED(2002, HttpStatus.CONFLICT),
    FLOW_JSON_INVALID(2003, HttpStatus.BAD_REQUEST),
    FLOW_JSON_TOO_LARGE(2004, HttpStatus.PAYLOAD_TOO_LARGE),
    TICKET_CALL_FLOW_VERSION_NOT_FOUND(2005, HttpStatus.NOT_FOUND),
    TICKET_CALL_FLOW_STATUS_INVALID(2008, HttpStatus.BAD_REQUEST),
    TICKET_CALL_FLOW_TRIGGER_INVALID(2010, HttpStatus.BAD_REQUEST),
    TICKET_CALL_FLOW_SLA_INVALID(2011, HttpStatus.BAD_REQUEST),
    TICKET_CALL_FLOW_SORT_INVALID(2012, HttpStatus.BAD_REQUEST),
    TICKET_CALL_FLOW_VERSION_NOT_DELETABLE(2013, HttpStatus.BAD_REQUEST);

    private final int code;
    /** Key i18n: err.code.&lt;TÊN_ENUM&gt;. */
    private final String message;
    private final HttpStatusCode statusCode;

    CoreErrorCode(int code, HttpStatusCode statusCode) {
        this.code = code;
        this.message = "err.code." + name();
        this.statusCode = statusCode;
    }
}
