package com.lifesup.ticketflow.integration.common.enums;

/** Lỗi khi test kết nối. Message i18n: connection.test.&lt;TÊN&gt;. */
public enum ConnectionTestError {
    DNS_FAILED,
    CONNECT_TIMEOUT,
    CONNECT_REFUSED,
    TLS_ERROR,
    HTTP_ERROR
}
