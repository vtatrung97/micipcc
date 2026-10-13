package com.lifesup.ticketflow.engine.client.dto;

import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Yêu cầu gửi thông báo. Có đúng một trong hai danh sách người nhận. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationSendRequest {
    /** SMS / EMAIL. */
    String channel;
    /** Địa chỉ trực tiếp (số điện thoại / email), khi người nhận lấy từ biến. */
    List<String> recipients;
    /** Người dùng, integration-service tra địa chỉ theo kênh. */
    List<String> recipientUserIds;
    String title;
    String content;
    String idempotencyKey;
    ExecutionContextInfo context;
}
