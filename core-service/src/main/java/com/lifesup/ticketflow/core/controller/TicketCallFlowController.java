package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCloneRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowPublishRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.service.TicketCallFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    @Operation(
            summary = "Danh sách quy trình (không kèm flowJson)",
            description = "Kèm số phiên bản hiệu lực / bản nháp. Sắp xếp theo lần cập nhật gần nhất. "
                    + "Tab \"Đang hiệu lực\": status=ACTIVE; tab \"Có bản nháp\": hasDraft=true")
    @GetMapping
    public ApiResponse<PageResponse<TicketCallFlowSummaryResponse>> search(
            @Parameter(description = "Tìm theo mã hoặc tên") @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TicketCallFlowStatus status,
            @Parameter(description = "true = chỉ quy trình có bản nháp, false = không có, bỏ trống = tất cả")
            @RequestParam(required = false) Boolean hasDraft,
            @Parameter(description = "Trang, bắt đầu từ 1") @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ApiResponse.success(ticketCallFlowService.search(keyword, status, hasDraft, page, size));
    }

    @Operation(summary = "Số liệu đầu màn danh sách: tổng số, đang hiệu lực, có bản nháp")
    @GetMapping("/stats")
    public ApiResponse<TicketCallFlowStatsResponse> stats() {
        return ApiResponse.success(ticketCallFlowService.stats());
    }

    @Operation(
            summary = "Chi tiết quy trình, kèm flowJson để vẽ lại canvas",
            description = "flowJson là bản nháp nếu có, không thì bản đang hiệu lực; "
                    + "kèm thông tin publishedVersion và draftVersion")
    @GetMapping("/{id}")
    public ApiResponse<TicketCallFlowResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(ticketCallFlowService.getById(id));
    }

    @Operation(summary = "Tạo quy trình mới từ canvas")
    @PostMapping
    public ApiResponse<TicketCallFlowResponse> create(@Valid @RequestBody TicketCallFlowCreateRequest request) {
        return ApiResponse.success(ticketCallFlowService.create(request));
    }

    @Operation(
            summary = "Lưu lại quy trình (ghi đè flowJson, tên, mô tả, trạng thái)",
            description = "Truyền rowVersion lấy từ lần GET gần nhất để chặn ghi đè khi người khác đã sửa (409)")
    @PutMapping("/{id}")
    public ApiResponse<TicketCallFlowResponse> update(
            @PathVariable Long id, @Valid @RequestBody TicketCallFlowUpdateRequest request) {
        return ApiResponse.success(ticketCallFlowService.update(id, request));
    }

    @Operation(
            summary = "Nhân bản quy trình",
            description = "Tạo quy trình mới với mã/tên mới, giữ nguyên flowJson của bản gốc, trạng thái DRAFT")
    @PostMapping("/{id}/clone")
    public ApiResponse<TicketCallFlowResponse> clone(
            @PathVariable Long id, @Valid @RequestBody TicketCallFlowCloneRequest request) {
        return ApiResponse.success(ticketCallFlowService.clone(id, request));
    }

    @Operation(
            summary = "Publish bản nháp",
            description = "Bản nháp thành phiên bản hiệu lực, bản hiệu lực cũ chuyển ARCHIVED. "
                    + "Lần publish đầu tiên chuyển quy trình từ DRAFT sang ACTIVE")
    @PostMapping("/{id}/publish")
    public ApiResponse<TicketCallFlowResponse> publish(
            @PathVariable Long id, @Valid @RequestBody(required = false) TicketCallFlowPublishRequest request) {
        return ApiResponse.success(ticketCallFlowService.publish(id, orEmpty(request)));
    }

    @Operation(
            summary = "Huỷ bản nháp, quay về bản đang hiệu lực",
            description = "Không áp dụng cho quy trình chưa publish lần nào (hãy xoá quy trình)")
    @PostMapping("/{id}/discard-draft")
    public ApiResponse<TicketCallFlowResponse> discardDraft(
            @PathVariable Long id, @Valid @RequestBody(required = false) TicketCallFlowPublishRequest request) {
        return ApiResponse.success(ticketCallFlowService.discardDraft(id, orEmpty(request)));
    }

    @Operation(summary = "Lịch sử phiên bản (không kèm flowJson), mới nhất trước")
    @GetMapping("/{id}/versions")
    public ApiResponse<List<TicketCallFlowVersionSummaryResponse>> getVersions(@PathVariable Long id) {
        return ApiResponse.success(ticketCallFlowService.getVersions(id));
    }

    @Operation(summary = "Chi tiết một phiên bản, kèm flowJson")
    @GetMapping("/{id}/versions/{versionNo}")
    public ApiResponse<TicketCallFlowVersionResponse> getVersion(
            @PathVariable Long id, @PathVariable Integer versionNo) {
        return ApiResponse.success(ticketCallFlowService.getVersion(id, versionNo));
    }

    @Operation(summary = "Xoá quy trình (xoá mềm)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ticketCallFlowService.delete(id);
        return ApiResponse.success();
    }

    private static TicketCallFlowPublishRequest orEmpty(TicketCallFlowPublishRequest request) {
        return request != null ? request : new TicketCallFlowPublishRequest();
    }
}
