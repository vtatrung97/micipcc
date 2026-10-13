package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.common.enums.NotificationChannel;
import com.lifesup.ticketflow.engine.common.enums.RecipientSource;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** NOTIFICATION: gửi SMS / email qua integration-service. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class NotificationNodeConfig implements NodeConfig {
    NotificationChannel channel;
    RecipientSource recipientSource;
    /** Biến chứa địa chỉ nhận (số điện thoại / email), dùng khi recipientSource = VARIABLE. */
    String recipientVariable;
    /** Người dùng nhận, dùng khi recipientSource = USER. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<String> recipientUserIds = new ArrayList<>();
    String title;
    String content;
}
