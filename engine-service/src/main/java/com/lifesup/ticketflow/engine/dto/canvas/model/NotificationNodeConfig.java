package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Cấu hình gửi thông báo. */
@Data
public class NotificationNodeConfig {
    private List<String> recipientIds;
    private String content;
    private List<String> channels;
}
