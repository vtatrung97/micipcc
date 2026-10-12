package com.lifesup.ticketflow.integration.common.exception;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.exception.BaseErrorCode;
import com.lifesup.ticketflow.common.exception.BaseExceptionHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Handler lỗi của integration-service. Các lỗi chung xử lý ở {@link BaseExceptionHandler}; ở đây chỉ thêm case riêng:
 * hai request cùng tạo một mã (lọt qua bước kiểm tra trước khi lưu) vướng unique key thì trả lỗi "mã đã tồn tại"
 * thay vì DATA_CONFLICT chung chung.
 */
@Slf4j
@RestControllerAdvice
public class IntegrationExceptionHandler extends BaseExceptionHandler {

    /** Tên unique key trong db/table_setup → mã lỗi tương ứng. */
    static final Map<String, BaseErrorCode> UNIQUE_KEY_ERRORS = Map.of(
            "uk_external_system_active_code", IntegrationErrorCode.EXTERNAL_SYSTEM_CODE_EXISTED,
            "uk_connection_active_code", IntegrationErrorCode.CONNECTION_CODE_EXISTED,
            "uk_operation_active_code_version", IntegrationErrorCode.OPERATION_CODE_EXISTED);

    @Override
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String constraint = constraintName(ex, UNIQUE_KEY_ERRORS.keySet().toArray(String[]::new));
        if (constraint == null) {
            return super.handleDataIntegrityViolation(ex);
        }
        log.warn("Unique key violated: {}", constraint);
        return build(UNIQUE_KEY_ERRORS.get(constraint));
    }
}
