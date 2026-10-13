package com.lifesup.ticketflow.integration.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.ConnectionCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionTestRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ConnectionResponse;
import com.lifesup.ticketflow.integration.dto.response.ConnectionSummaryResponse;
import com.lifesup.ticketflow.integration.dto.response.ConnectionTestResponse;
import com.lifesup.ticketflow.integration.service.ConnectionService;
import com.lifesup.ticketflow.integration.service.ConnectionTestService;
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
import org.springframework.web.bind.annotation.RestController;

/** Kết nối tới hệ thống thứ 3 (endpoint gốc, xác thực, chịu lỗi) và test kết nối. */
@Tag(name = "Integration connection")
@RestController
@RequestMapping("/api/v1/integrations/connections")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConnectionController {

    ConnectionService connectionService;
    ConnectionTestService connectionTestService;

    @GetMapping
    public ApiResponse<PageResponse<ConnectionSummaryResponse>> search(@Valid ConnectionSearchRequest request) {
        return ApiResponse.success(connectionService.search(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ConnectionResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(connectionService.getById(id));
    }

    @PostMapping
    public ApiResponse<ConnectionResponse> create(@Valid @RequestBody ConnectionCreateRequest request) {
        return ApiResponse.success(connectionService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ConnectionResponse> update(
            @PathVariable Long id, @Valid @RequestBody ConnectionUpdateRequest request) {
        return ApiResponse.success(connectionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        connectionService.delete(id);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/test")
    public ApiResponse<ConnectionTestResponse> test(@PathVariable Long id) {
        return ApiResponse.success(connectionTestService.test(id));
    }

    @PostMapping("/test")
    public ApiResponse<ConnectionTestResponse> testUnsaved(@Valid @RequestBody ConnectionTestRequest request) {
        return ApiResponse.success(connectionTestService.test(request));
    }
}
