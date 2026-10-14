package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AccountUserDto;
import com.lifesup.ticketflow.core.dto.request.AgentSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentResponse;

/** Đồng bộ user tài khoản (Keycloak) sang bảng user_account. */
public interface AgentService {

    /** Tìm agent theo username (tương đối), sắp theo username tăng dần. */
    PageResponse<AgentResponse> search(AgentSearchRequest request);

    /** Có agent cùng id thì cập nhật, chưa có thì tạo mới. */
    void saveOrUpdateAgent(AccountUserDto userDto);

    void createAgent(AccountUserDto userDto);

    void deleteAgent(AccountUserDto userDto);
}
