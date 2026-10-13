package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.ConnectionCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ConnectionResponse;
import com.lifesup.ticketflow.integration.dto.response.ConnectionSummaryResponse;

public interface ConnectionService {

    PageResponse<ConnectionSummaryResponse> search(ConnectionSearchRequest request);

    ConnectionResponse getById(Long id);

    ConnectionResponse create(ConnectionCreateRequest request);

    ConnectionResponse update(Long id, ConnectionUpdateRequest request);

    void delete(Long id);
}
