package com.lifesup.ticketflow.integration.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.OperationCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationUpdateRequest;
import com.lifesup.ticketflow.integration.dto.request.RowVersionRequest;
import com.lifesup.ticketflow.integration.dto.response.OperationResponse;
import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.service.OperationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** API (operation) gọi qua một kết nối, có version: chỉ sửa / xoá bản nháp, bản đã ACTIVE muốn đổi thì tạo version mới. */
@Tag(name = "Integration operation")
@RestController
@RequestMapping("/api/v1/integrations/operations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OperationController {

    OperationService operationService;

    @GetMapping
    public ApiResponse<PageResponse<OperationSummaryResponse>> search(@Valid OperationSearchRequest request) {
        return ApiResponse.success(operationService.search(request));
    }

    @GetMapping("/active")
    public ApiResponse<List<OperationSummaryResponse>> findUsable(
            @RequestParam(required = false) String keyword, @RequestParam(required = false) Long systemId) {
        return ApiResponse.success(operationService.findUsable(keyword, systemId));
    }

    @GetMapping("/{id}")
    public ApiResponse<OperationResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(operationService.getById(id));
    }

    @GetMapping("/{id}/versions")
    public ApiResponse<List<OperationSummaryResponse>> getVersions(@PathVariable Long id) {
        return ApiResponse.success(operationService.getVersions(id));
    }

    @PostMapping
    public ApiResponse<OperationResponse> create(@Valid @RequestBody OperationCreateRequest request) {
        return ApiResponse.success(operationService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<OperationResponse> update(
            @PathVariable Long id, @Valid @RequestBody OperationUpdateRequest request) {
        return ApiResponse.success(operationService.update(id, request));
    }

    @PostMapping("/{id}/new-version")
    public ApiResponse<OperationResponse> createNewVersion(@PathVariable Long id) {
        return ApiResponse.success(operationService.createNewVersion(id));
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<OperationResponse> activate(
            @PathVariable Long id, @RequestBody(required = false) RowVersionRequest request) {
        return ApiResponse.success(operationService.activate(id, rowVersionOf(request)));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<OperationResponse> deactivate(
            @PathVariable Long id, @RequestBody(required = false) RowVersionRequest request) {
        return ApiResponse.success(operationService.deactivate(id, rowVersionOf(request)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        operationService.delete(id);
        return ApiResponse.success();
    }

    private static Long rowVersionOf(RowVersionRequest request) {
        return request != null ? request.getRowVersion() : null;
    }
}
