package com.lifesup.ticketflow.engine.client;

/** Lỗi kỹ thuật khi gọi integration-service (không kết nối được, timeout, 5xx, phản hồi sai định dạng). */
public class IntegrationException extends RuntimeException {
    public IntegrationException(String message) {
        super(message);
    }

    public IntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
