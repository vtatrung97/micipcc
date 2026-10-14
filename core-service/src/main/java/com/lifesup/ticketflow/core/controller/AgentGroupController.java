package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AgentGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentGroupResponse;
import com.lifesup.ticketflow.core.service.AgentGroupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Agent group")
@RestController
@RequestMapping("/api/v1/agent-groups")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AgentGroupController {

    AgentGroupService agentGroupService;

    @GetMapping
    public ApiResponse<PageResponse<AgentGroupResponse>> search(@Valid AgentGroupSearchRequest request) {
        return ApiResponse.success(agentGroupService.search(request));
    }
}
