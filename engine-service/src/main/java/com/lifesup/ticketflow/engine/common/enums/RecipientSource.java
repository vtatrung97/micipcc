package com.lifesup.ticketflow.engine.common.enums;

/** Nguồn người nhận của node NOTIFICATION. */
public enum RecipientSource {
    /** Lấy địa chỉ (số điện thoại / email) từ một biến của quy trình. */
    VARIABLE,
    /** Gửi cho danh sách người dùng cố định, integration-service tra địa chỉ theo người dùng. */
    USER
}
