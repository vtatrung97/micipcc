package com.lifesup.ticketflow.engine.client.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Kết quả nhận yêu cầu gửi thông báo; accepted = false là lỗi nghiệp vụ (VD địa chỉ không hợp lệ). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationSendResult {
    boolean accepted;
    String errorMessage;

    public static NotificationSendResult ok() {
        return new NotificationSendResult(true, null);
    }
}
