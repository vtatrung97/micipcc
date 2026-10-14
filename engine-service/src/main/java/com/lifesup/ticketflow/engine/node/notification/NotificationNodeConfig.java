package com.lifesup.ticketflow.engine.node.notification;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.workflow.NodeConfig;
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
public class NotificationNodeConfig implements NodeConfig {
    Channel channel;
    RecipientSource recipientSource;
    /** Biến chứa địa chỉ nhận (số điện thoại / email), dùng khi recipientSource = VARIABLE. */
    String recipientVariable;
    /** Người dùng nhận, dùng khi recipientSource = USER. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<String> recipientUserIds = new ArrayList<>();
    String title;
    String content;

    public enum Channel {
        SMS,
        EMAIL
    }

    public enum RecipientSource {
        /** Lấy địa chỉ (số điện thoại / email) từ một biến của quy trình. */
        VARIABLE,
        /** Danh sách người dùng cố định, integration-service tra địa chỉ theo người dùng. */
        USER
    }
}
