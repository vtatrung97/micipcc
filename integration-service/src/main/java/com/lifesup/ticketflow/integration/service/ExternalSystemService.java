package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ExternalSystemResponse;

public interface ExternalSystemService {

    PageResponse<ExternalSystemResponse> search(ExternalSystemSearchRequest request);

    ExternalSystemResponse getById(Long id);

    ExternalSystemResponse create(ExternalSystemCreateRequest request);

    ExternalSystemResponse update(Long id, ExternalSystemUpdateRequest request);

    void delete(Long id);
}
