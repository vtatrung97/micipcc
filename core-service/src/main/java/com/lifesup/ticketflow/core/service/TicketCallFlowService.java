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

    /** Lưu tên, mô tả, trạng thái và ghi canvas vào bản nháp (chưa có thì tạo bản nháp mới). */
    TicketCallFlowResponse update(Long id, TicketCallFlowUpdateRequest request);

    /** Tạo quy trình mới (DRAFT) sao chép flowJson mới nhất từ quy trình {@code sourceId}. */
    TicketCallFlowResponse clone(Long sourceId, TicketCallFlowCloneRequest request);

    /** Bản nháp thành phiên bản hiệu lực, bản hiệu lực cũ chuyển sang ARCHIVED. */
    TicketCallFlowResponse publish(Long id, TicketCallFlowPublishRequest request);

    /** Bỏ bản nháp, quay về bản đang hiệu lực. */
    TicketCallFlowResponse discardDraft(Long id, TicketCallFlowPublishRequest request);

    TicketCallFlowResponse getById(Long id);

    PageResponse<TicketCallFlowSummaryResponse> search(TicketCallFlowSearchRequest request);

    TicketCallFlowStatsResponse stats();

    /** Lịch sử phiên bản, mới nhất trước. */
    List<TicketCallFlowVersionSummaryResponse> getVersions(Long id);

    TicketCallFlowVersionResponse getVersion(Long id, Integer versionNo);

    void delete(Long id);
}
