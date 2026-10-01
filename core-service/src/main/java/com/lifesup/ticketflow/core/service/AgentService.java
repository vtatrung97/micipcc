package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.core.dto.request.AccountUserDto;

/** Đồng bộ user tài khoản (Keycloak) sang bảng user_account. */
public interface AgentService {

    /** Có agent cùng id thì cập nhật, chưa có thì tạo mới. */
    void saveOrUpdateAgent(AccountUserDto userDto);

    void createAgent(AccountUserDto userDto);

    void deleteAgent(AccountUserDto userDto);
}
