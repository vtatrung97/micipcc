package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AgentGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentGroupResponse;

public interface AgentGroupService {

    /** Tìm nhóm agent theo tên (tương đối), sắp theo tên tăng dần. */
    PageResponse<AgentGroupResponse> search(AgentGroupSearchRequest request);
}
