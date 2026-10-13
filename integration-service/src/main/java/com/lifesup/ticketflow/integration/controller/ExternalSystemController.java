package com.lifesup.ticketflow.integration.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ExternalSystemResponse;
import com.lifesup.ticketflow.integration.service.ExternalSystemService;
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

/** Hệ thống thứ 3 được khai báo để tích hợp. */
@Tag(name = "Integration external system")
@RestController
@RequestMapping("/api/v1/integrations/systems")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExternalSystemController {

    ExternalSystemService externalSystemService;

    @GetMapping
    public ApiResponse<PageResponse<ExternalSystemResponse>> search(@Valid ExternalSystemSearchRequest request) {
        return ApiResponse.success(externalSystemService.search(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<ExternalSystemResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(externalSystemService.getById(id));
    }

    @PostMapping
    public ApiResponse<ExternalSystemResponse> create(@Valid @RequestBody ExternalSystemCreateRequest request) {
        return ApiResponse.success(externalSystemService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ExternalSystemResponse> update(
            @PathVariable Long id, @Valid @RequestBody ExternalSystemUpdateRequest request) {
        return ApiResponse.success(externalSystemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        externalSystemService.delete(id);
        return ApiResponse.success();
    }
}
