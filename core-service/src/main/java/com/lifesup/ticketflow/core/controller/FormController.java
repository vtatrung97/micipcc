package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.FormSearchRequest;
import com.lifesup.ticketflow.core.dto.response.FormResponse;
import com.lifesup.ticketflow.core.service.FormService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Form")
@RestController
@RequestMapping("/api/v1/forms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FormController {

    FormService formService;

    @GetMapping
    public ApiResponse<PageResponse<FormResponse>> search(@Valid FormSearchRequest request) {
        return ApiResponse.success(formService.search(request));
    }
}
