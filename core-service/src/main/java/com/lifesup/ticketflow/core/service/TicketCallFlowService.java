package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;

public interface TicketCallFlowService {

    TicketCallFlowResponse create(TicketCallFlowCreateRequest request);

    TicketCallFlowResponse update(Long id, TicketCallFlowUpdateRequest request);

    TicketCallFlowResponse getById(Long id);

    /** @param page bắt đầu từ 1 */
    PageResponse<TicketCallFlowSummaryResponse> search(String keyword, TicketCallFlowStatus status, int page, int size);

    void delete(Long id);
}
