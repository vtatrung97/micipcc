package com.lifesup.ticketflow.integration.common.enums;

/** Cơ chế xác thực của kết nối (BR-INT-02). Secret lưu ở Vault, bảng chỉ giữ tham chiếu. */
public enum AuthType {
    NONE,
    API_KEY,
    BASIC,
    BEARER,
    OAUTH2_CLIENT_CREDENTIALS
}
