package com.lifesup.ticketflow.integration.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.service.OperationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Integration operation")
@RestController
@RequestMapping("/api/v1/integrations/operations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OperationController {

    OperationService operationService;

    @GetMapping
    public ApiResponse<List<OperationSummaryResponse>> search(
            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(operationService.search(keyword));
    }
}
