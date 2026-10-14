package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AppParamCreateRequest;
import com.lifesup.ticketflow.core.dto.request.AppParamSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AppParamResponse;
import com.lifesup.ticketflow.core.service.AppParamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "App param")
@RestController
@RequestMapping("/api/v1/app-params")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppParamController {

    AppParamService appParamService;

    @GetMapping
    public ApiResponse<PageResponse<AppParamResponse>> search(@Valid AppParamSearchRequest request) {
        return ApiResponse.success(appParamService.search(request));
    }

    @PostMapping
    public ApiResponse<AppParamResponse> create(@Valid @RequestBody AppParamCreateRequest request) {
        return ApiResponse.success(appParamService.create(request));
    }
}
