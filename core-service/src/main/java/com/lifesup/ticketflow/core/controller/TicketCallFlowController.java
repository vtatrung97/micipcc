package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.core.dto.response.ApiResponse;
import com.lifesup.ticketflow.core.dto.response.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
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

    @Operation(summary = "Danh sách quy trình (không kèm flowJson)", description = "Sắp xếp theo lần cập nhật gần nhất")
    @GetMapping
    public ApiResponse<PageResponse<TicketCallFlowSummaryResponse>> search(
            @Parameter(description = "Tìm theo mã hoặc tên") @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TicketCallFlowStatus status,
            @Parameter(description = "Trang, bắt đầu từ 1") @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ApiResponse.success(ticketCallFlowService.search(keyword, status, page, size));
    }

    @Operation(summary = "Chi tiết quy trình, kèm flowJson để vẽ lại canvas")
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

    @Operation(summary = "Xoá quy trình (xoá mềm)")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ticketCallFlowService.delete(id);
        return ApiResponse.success();
    }
}
