package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCloneRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowPublishRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowSearchRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;

import java.util.List;

public interface TicketCallFlowService {

    TicketCallFlowResponse create(TicketCallFlowCreateRequest request);

    /**
     * Lưu thông tin chung và canvas vào phiên bản {@code versionId}.
     * Phiên bản đang ban hành thì giữ nguyên, sinh phiên bản DRAFT mới; trạng thái khác thì sửa trực tiếp.
     */
    TicketCallFlowResponse update(Long id, Long versionId, TicketCallFlowUpdateRequest request);

    /** Tạo quy trình mới (DRAFT) sao chép flowJson của phiên bản {@code versionId}. */
    TicketCallFlowResponse clone(Long id, Long versionId, TicketCallFlowCloneRequest request);

    /** Ban hành phiên bản {@code versionId}, bản đang ban hành (nếu có) chuyển sang ARCHIVED. */
    TicketCallFlowResponse publish(Long id, Long versionId, TicketCallFlowPublishRequest request);

    TicketCallFlowResponse getById(Long id);

    /** Mỗi phiên bản một dòng. */
    PageResponse<TicketCallFlowSummaryResponse> search(TicketCallFlowSearchRequest request);

    TicketCallFlowStatsResponse stats();

    /** Lịch sử phiên bản, mới nhất trước. */
    List<TicketCallFlowVersionSummaryResponse> getVersions(Long id);

    TicketCallFlowVersionResponse getVersion(Long id, Long versionId);

    /** Xoá phiên bản {@code versionId}; không còn phiên bản nào thì xoá luôn quy trình. */
    void delete(Long id, Long versionId);
}
