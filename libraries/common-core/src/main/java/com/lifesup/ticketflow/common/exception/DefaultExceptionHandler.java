package com.lifesup.ticketflow.common.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handler mặc định, chỉ được đăng ký khi service không khai báo handler riêng (kế thừa {@link BaseExceptionHandler}).
 */
@RestControllerAdvice
public class DefaultExceptionHandler extends BaseExceptionHandler {
}
