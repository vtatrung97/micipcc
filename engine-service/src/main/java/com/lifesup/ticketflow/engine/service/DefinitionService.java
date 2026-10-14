package com.lifesup.ticketflow.engine.service;

import com.lifesup.ticketflow.engine.dto.request.DeployDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.request.ValidateDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.response.DeploymentResponse;
import com.lifesup.ticketflow.engine.dto.response.ValidationResultResponse;

/** Kiểm tra và deploy định nghĩa quy trình. */
public interface DefinitionService {

    /** Kiểm tra flowJson, trả danh sách lỗi (không ném lỗi khi quy trình sai). */
    ValidationResultResponse validate(ValidateDefinitionRequest request);

    /** Chuyển và deploy lên Flowable; quy trình sai ném WorkflowValidationException. */
    DeploymentResponse deploy(DeployDefinitionRequest request);
}
