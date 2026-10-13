package com.lifesup.ticketflow.engine.common.exception;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.exception.BaseExceptionHandler;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidationError;
import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.flowable.common.engine.api.FlowableException;
import org.flowable.common.engine.api.FlowableObjectNotFoundException;
import org.flowable.common.engine.api.FlowableOptimisticLockingException;
import org.flowable.common.engine.api.FlowableTaskAlreadyClaimedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handler lỗi của engine-service. Lỗi chung xử lý ở {@link BaseExceptionHandler}; ở đây thêm lỗi validate quy trình
 * (trả kèm danh sách lỗi để FE tô đúng node) và các exception của Flowable.
 */
@Slf4j
@RestControllerAdvice
public class EngineExceptionHandler extends BaseExceptionHandler {

    /** Quy trình không hợp lệ: result là toàn bộ lỗi, mỗi lỗi có mã, node và field. */
    @ExceptionHandler(WorkflowValidationException.class)
    public ResponseEntity<ApiResponse<List<WorkflowValidationError>>> handleWorkflowInvalid(
            WorkflowValidationException ex) {
        EngineErrorCode errorCode = EngineErrorCode.WORKFLOW_INVALID;
        log.warn("Workflow invalid: {} error(s)", ex.getErrors().size());
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.error(errorCode, translate(errorCode), ex.getErrors()));
    }

    @ExceptionHandler(FlowableObjectNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFlowableNotFound(FlowableObjectNotFoundException ex) {
        log.warn("Flowable object not found: {}", ex.getMessage());
        return build(ErrorCode.RESOURCE_NOT_FOUND);
    }

    @ExceptionHandler(FlowableTaskAlreadyClaimedException.class)
    public ResponseEntity<ApiResponse<Void>> handleTaskAlreadyClaimed(FlowableTaskAlreadyClaimedException ex) {
        return build(EngineErrorCode.TASK_ALREADY_CLAIMED);
    }

    /** Hai luồng cùng cập nhật một execution (VD hai người hoàn thành task cùng lúc). */
    @ExceptionHandler(FlowableOptimisticLockingException.class)
    public ResponseEntity<ApiResponse<Void>> handleFlowableOptimisticLock(FlowableOptimisticLockingException ex) {
        log.warn("Flowable optimistic lock: {}", ex.getMessage());
        return build(ErrorCode.DATA_CONFLICT);
    }

    /** Lỗi khi chạy quy trình trong request (VD đánh giá điều kiện lỗi mà gateway không có nhánh error). */
    @ExceptionHandler(FlowableException.class)
    public ResponseEntity<ApiResponse<Void>> handleFlowable(FlowableException ex) {
        log.error("Flowable execution failed", ex);
        return build(EngineErrorCode.PROCESS_EXECUTION_FAILED);
    }
}
