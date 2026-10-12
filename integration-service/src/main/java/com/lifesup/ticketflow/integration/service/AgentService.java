package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.integration.dto.request.AccountUserDto;

/** Đồng bộ user tài khoản (Keycloak) sang bảng user_account. */
public interface AgentService {

    /** Có agent cùng id thì cập nhật, chưa có thì tạo mới. */
    void saveOrUpdateAgent(AccountUserDto userDto);

    void createAgent(AccountUserDto userDto);

    void deleteAgent(AccountUserDto userDto);
}
