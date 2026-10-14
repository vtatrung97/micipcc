package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.KeycloakGroupResponse;
import com.lifesup.ticketflow.core.service.KeycloakGroupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Keycloak group")
@RestController
@RequestMapping("/api/v1/keycloak-groups")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KeycloakGroupController {

    KeycloakGroupService keycloakGroupService;

    @GetMapping
    public ApiResponse<PageResponse<KeycloakGroupResponse>> search(@Valid KeycloakGroupSearchRequest request) {
        return ApiResponse.success(keycloakGroupService.search(request));
    }
}
