package com.lifesup.ticketflow.core.common.exception;

import com.lifesup.ticketflow.common.exception.BaseExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handler lỗi của core-service. Các lỗi chung xử lý ở {@link BaseExceptionHandler};
 * case riêng của core-service thêm / override tại đây.
 */
@RestControllerAdvice
public class CoreExceptionHandler extends BaseExceptionHandler {
}
