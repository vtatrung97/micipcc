package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCloneRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowPublishRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowSearchRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.service.TicketCallFlowService;
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


import java.util.List;

/**
 * Quản lý quy trình ticket/call thiết kế trên Canvas: FE kéo thả xong gửi JSON canvas lên để lưu,
 * khi mở lại thì lấy chi tiết để vẽ lại đúng như lúc lưu.
 */
@Tag(name = "Ticket call flow")
@RestController
@RequestMapping("/api/v1/ticket-call-flows")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketCallFlowController {

    TicketCallFlowService ticketCallFlowService;

    @GetMapping
    public ApiResponse<PageResponse<TicketCallFlowSummaryResponse>> search(@Valid TicketCallFlowSearchRequest request) {
        return ApiResponse.success(ticketCallFlowService.search(request));
    }

    @GetMapping("/stats")
    public ApiResponse<TicketCallFlowStatsResponse> stats() {
        return ApiResponse.success(ticketCallFlowService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketCallFlowResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(ticketCallFlowService.getById(id));
    }

    @PostMapping
    public ApiResponse<TicketCallFlowResponse> create(@Valid @RequestBody TicketCallFlowCreateRequest request) {
        return ApiResponse.success(ticketCallFlowService.create(request));
    }

    @GetMapping("/{id}/versions")
    public ApiResponse<List<TicketCallFlowVersionSummaryResponse>> getVersions(@PathVariable Long id) {
        return ApiResponse.success(ticketCallFlowService.getVersions(id));
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ApiResponse<TicketCallFlowVersionResponse> getVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        return ApiResponse.success(ticketCallFlowService.getVersion(id, versionId));
    }

    @PutMapping("/{id}/versions/{versionId}")
    public ApiResponse<TicketCallFlowResponse> update(
            @PathVariable Long id, @PathVariable Long versionId,
            @Valid @RequestBody TicketCallFlowUpdateRequest request) {
        return ApiResponse.success(ticketCallFlowService.update(id, versionId, request));
    }

    @PostMapping("/{id}/versions/{versionId}/publish")
    public ApiResponse<TicketCallFlowResponse> publish(
            @PathVariable Long id, @PathVariable Long versionId,
            @Valid @RequestBody(required = false) TicketCallFlowPublishRequest request) {
        return ApiResponse.success(ticketCallFlowService.publish(id, versionId,
                request != null ? request : new TicketCallFlowPublishRequest()));
    }

    @PostMapping("/{id}/versions/{versionId}/clone")
    public ApiResponse<TicketCallFlowResponse> clone(
            @PathVariable Long id, @PathVariable Long versionId,
            @Valid @RequestBody TicketCallFlowCloneRequest request) {
        return ApiResponse.success(ticketCallFlowService.clone(id, versionId, request));
    }

    @DeleteMapping("/{id}/versions/{versionId}")
    public ApiResponse<Void> delete(@PathVariable Long id, @PathVariable Long versionId) {
        ticketCallFlowService.delete(id, versionId);
        return ApiResponse.success();
    }
}
