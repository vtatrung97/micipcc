package com.lifesup.ticketflow.engine.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.engine.dto.request.ClaimTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.CompleteTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.TaskSearchRequest;
import com.lifesup.ticketflow.engine.dto.response.TaskDetailResponse;
import com.lifesup.ticketflow.engine.dto.response.TaskResponse;
import com.lifesup.ticketflow.engine.service.UserTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API nội bộ (X-API-Key) cho core-service: task của USER_TASK. */
@Tag(name = "User task (internal)")
@RestController
@RequestMapping("/internal/v1/tasks")
@PreAuthorize("hasRole('SERVICE')")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserTaskController {
    UserTaskService userTaskService;

    @Operation(summary = "Tìm task đang mở (theo người được giao / người có thể nhận / nhóm / phiên chạy)")
    @GetMapping
    public ApiResponse<PageResponse<TaskResponse>> search(@Valid TaskSearchRequest request) {
        return ApiResponse.success(userTaskService.search(request));
    }

    @Operation(summary = "Chi tiết task kèm dữ liệu điền sẵn cho form")
    @GetMapping("/{taskId}")
    public ApiResponse<TaskDetailResponse> get(@PathVariable String taskId) {
        return ApiResponse.success(userTaskService.get(taskId));
    }

    @Operation(summary = "Nhận việc")
    @PostMapping("/{taskId}/claim")
    public ApiResponse<TaskResponse> claim(@PathVariable String taskId, @Valid @RequestBody ClaimTaskRequest request) {
        return ApiResponse.success(userTaskService.claim(taskId, request));
    }

    @Operation(summary = "Hoàn thành task, ghi dữ liệu form vào biến theo cấu hình node")
    @PostMapping("/{taskId}/complete")
    public ApiResponse<Void> complete(@PathVariable String taskId, @Valid @RequestBody CompleteTaskRequest request) {
        userTaskService.complete(taskId, request);
        return ApiResponse.success();
    }
}
