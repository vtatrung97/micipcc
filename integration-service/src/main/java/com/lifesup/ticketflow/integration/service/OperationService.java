package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.integration.dto.request.OperationCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.OperationResponse;
import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;

import java.util.List;

public interface OperationService {

    PageResponse<OperationSummaryResponse> search(OperationSearchRequest request);

    /** API dùng được trong Flow (hệ thống, kết nối, API cùng ACTIVE), không phân trang; systemId null = mọi hệ thống. */
    List<OperationSummaryResponse> findUsable(String keyword, Long systemId);

    OperationResponse getById(Long id);

    List<OperationSummaryResponse> getVersions(Long id);

    OperationResponse create(OperationCreateRequest request);

    OperationResponse update(Long id, OperationUpdateRequest request);

    OperationResponse createNewVersion(Long id);

    OperationResponse activate(Long id, Long rowVersion);

    OperationResponse deactivate(Long id, Long rowVersion);

    void delete(Long id);
}
