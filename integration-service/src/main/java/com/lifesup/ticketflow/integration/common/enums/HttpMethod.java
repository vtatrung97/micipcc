package com.lifesup.ticketflow.integration.common.enums;

/**
 * HTTP method của API (operation.http_method). Không dùng org.springframework.http.HttpMethod
 * vì enum đó có thêm HEAD/OPTIONS/TRACE (không có trong CHECK của bảng) và không map được bằng @Enumerated.
 */
public enum HttpMethod {
    GET,
    POST,
    PUT,
    PATCH,
    DELETE
}
