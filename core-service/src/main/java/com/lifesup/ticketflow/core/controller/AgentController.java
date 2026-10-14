package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AgentSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentResponse;
import com.lifesup.ticketflow.core.service.AgentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Agent")
@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AgentController {

    AgentService agentService;

    @GetMapping
    public ApiResponse<PageResponse<AgentResponse>> search(@Valid AgentSearchRequest request) {
        return ApiResponse.success(agentService.search(request));
    }
}
