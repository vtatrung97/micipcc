package com.lifesup.ticketflow.common.exception;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.i18n.Translator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Message của AppException là key i18n (mặc định là key của ErrorCode) thì dịch theo ngôn ngữ request,
     * còn là câu cụ thể (new AppException(code, "...")) thì trả nguyên văn.
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        String errorMessage = ex.getMessage() != null ? Translator.toLocale(ex.getMessage()) : translate(errorCode);
        if (errorCode.getStatusCode().is5xxServerError()) {
            log.error("AppException {}: {}", errorCode, ex.getMessage(), ex);
        } else {
            log.warn("AppException {}: {}", errorCode, ex.getMessage());
        }
        return build(errorCode, errorMessage);
    }

    /** Lỗi validate body (@Valid): message là lỗi đầu tiên, result là lỗi đầu tiên của từng field. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), translate(fieldError));
        }
        List<ObjectError> errors = ex.getBindingResult().getAllErrors();
        String message = errors.isEmpty() ? translate(errorCode) : translate(errors.get(0));
        log.warn("Validation failed: {}", fieldErrors);
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode, message, fieldErrors.isEmpty() ? null : fieldErrors));
    }

    @ExceptionHandler({
        HandlerMethodValidationException.class,
        MissingServletRequestParameterException.class,
        MissingRequestHeaderException.class,
        MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleInvalidRequest(Exception ex) {
        log.warn("Invalid request: {}", ex.getMessage());
        return build(ErrorCode.INVALID_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Malformed request body: {}", ex.getMessage());
        return build(ErrorCode.MALFORMED_REQUEST);
    }

    /** Lỗi phân quyền phát sinh trong controller/service (@PreAuthorize). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return build(ErrorCode.ACCESS_DENIED);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoResourceFoundException ex) {
        return build(ErrorCode.RESOURCE_NOT_FOUND);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return build(ErrorCode.METHOD_NOT_ALLOWED);
    }

    /** Hai người cùng lưu một bản ghi (optimistic lock) hoặc vi phạm ràng buộc unique/khoá ngoại. */
    @ExceptionHandler({ObjectOptimisticLockingFailureException.class, DataIntegrityViolationException.class})
    public ResponseEntity<ApiResponse<Void>> handleConflict(Exception ex) {
        log.warn("Data conflict: {}", ex.getMessage());
        return build(ErrorCode.DATA_CONFLICT);
    }

    @ExceptionHandler({RedisConnectionFailureException.class, RedisSystemException.class})
    public ResponseEntity<ApiResponse<Void>> handleRedis(Exception ex) {
        log.error("Redis error occurred", ex);
        return build(ErrorCode.REDIS_UNAVAILABLE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception ex) {
        log.error("Unhandled exception", ex);
        return build(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    private ResponseEntity<ApiResponse<Void>> build(ErrorCode errorCode) {
        return build(errorCode, translate(errorCode));
    }

    private ResponseEntity<ApiResponse<Void>> build(ErrorCode errorCode, String message) {
        return ResponseEntity.status(errorCode.getStatusCode()).body(ApiResponse.error(errorCode, message, null));
    }

    private static String translate(ErrorCode errorCode) {
        return Translator.toLocale(errorCode.getMessage());
    }

    /** Message của annotation validate có thể là key ("validation.x") hoặc đã được dịch sẵn ("{validation.x}"). */
    private static String translate(ObjectError error) {
        String message = error.getDefaultMessage();
        return message != null ? Translator.toLocale(message) : translate(ErrorCode.INVALID_REQUEST);
    }
}
