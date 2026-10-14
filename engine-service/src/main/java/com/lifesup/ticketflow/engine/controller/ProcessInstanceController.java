package com.lifesup.ticketflow.engine.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.engine.dto.request.CancelInstanceRequest;
import com.lifesup.ticketflow.engine.dto.request.StartInstanceRequest;
import com.lifesup.ticketflow.engine.dto.response.ProcessInstanceResponse;
import com.lifesup.ticketflow.engine.service.ProcessInstanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API nội bộ (X-API-Key) cho core-service: phiên chạy quy trình. */
@Tag(name = "Process instance (internal)")
@RestController
@RequestMapping("/internal/v1/instances")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProcessInstanceController {
    ProcessInstanceService processInstanceService;

    @Operation(summary = "Khởi tạo phiên chạy theo phiên bản deploy mới nhất")
    @PostMapping
    public ApiResponse<ProcessInstanceResponse> start(@Valid @RequestBody StartInstanceRequest request) {
        return ApiResponse.success(processInstanceService.start(request));
    }

    @Operation(summary = "Trạng thái, bước đang chạy và biến của phiên chạy")
    @GetMapping("/{processInstanceId}")
    public ApiResponse<ProcessInstanceResponse> get(@PathVariable String processInstanceId) {
        return ApiResponse.success(processInstanceService.get(processInstanceId));
    }

    @Operation(summary = "Huỷ phiên chạy đang chạy")
    @PostMapping("/{processInstanceId}/cancel")
    public ApiResponse<Void> cancel(@PathVariable String processInstanceId,
            @RequestBody(required = false) CancelInstanceRequest request) {
        processInstanceService.cancel(processInstanceId, request);
        return ApiResponse.success();
    }
}
