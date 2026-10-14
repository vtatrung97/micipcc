package com.lifesup.ticketflow.engine.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.engine.dto.request.DeployDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.request.ValidateDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.response.DeploymentResponse;
import com.lifesup.ticketflow.engine.dto.response.ValidationResultResponse;
import com.lifesup.ticketflow.engine.service.DefinitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API nội bộ (X-API-Key) cho core-service: kiểm tra và deploy định nghĩa quy trình. */
@Tag(name = "Process definition (internal)")
@RestController
@RequestMapping("/internal/v1/definitions")
@PreAuthorize("hasRole('SERVICE')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DefinitionController {
    DefinitionService definitionService;

    @Operation(summary = "Kiểm tra flowJson, trả danh sách lỗi nếu có (không deploy)")
    @PostMapping("/validate")
    public ApiResponse<ValidationResultResponse> validate(@Valid @RequestBody ValidateDefinitionRequest request) {
        return ApiResponse.success(definitionService.validate(request));
    }

    @Operation(summary = "Chuyển flowJson sang BPMN và deploy", description = "Quy trình sai trả mã 4000 kèm danh sách lỗi")
    @PostMapping("/deploy")
    public ApiResponse<DeploymentResponse> deploy(@Valid @RequestBody DeployDefinitionRequest request) {
        return ApiResponse.success(definitionService.deploy(request));
    }
}
