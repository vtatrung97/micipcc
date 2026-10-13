package com.lifesup.ticketflow.engine.node.notification;

import com.lifesup.ticketflow.engine.client.IntegrationClient;
import com.lifesup.ticketflow.engine.client.dto.ExecutionContextInfo;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendRequest;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendResult;
import com.lifesup.ticketflow.engine.node.notification.NotificationNodeConfig.RecipientSource;
import com.lifesup.ticketflow.engine.workflow.NodeConfigReader;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

/**
 * Chạy NOTIFICATION: xác định người nhận rồi gửi qua integration-service.
 *
 * <p>Thông báo không chặn quy trình: không có người nhận hoặc integration-service từ chối thì ghi log và đi tiếp.
 * Chỉ lỗi kỹ thuật (không gọi được integration-service) mới làm job lỗi để thử lại.
 */
@Slf4j
@Component(NotificationDelegate.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationDelegate implements JavaDelegate {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "notificationDelegate";

    NodeConfigReader configReader;
    IntegrationClient integrationClient;

    @Override
    public void execute(DelegateExecution execution) {
        NotificationNodeConfig config = configReader.read(execution, NotificationNodeConfig.class);
        boolean fromVariable = config.getRecipientSource() == RecipientSource.VARIABLE;
        List<String> recipients = fromVariable ? addresses(execution.getVariable(config.getRecipientVariable())) : List.of();
        List<String> userIds = fromVariable ? List.of() : config.getRecipientUserIds();
        if (recipients.isEmpty() && userIds.isEmpty()) {
            log.warn("Notification {} skipped: no recipient (process instance {})",
                    execution.getCurrentActivityId(), execution.getProcessInstanceId());
            return;
        }

        NotificationSendResult result = integrationClient.sendNotification(new NotificationSendRequest(
                config.getChannel().name(), recipients, userIds, config.getTitle(), config.getContent(),
                ExecutionContextInfo.idempotencyKey(execution), ExecutionContextInfo.of(execution)));
        if (!result.isAccepted()) {
            log.warn("Notification {} rejected: {} (process instance {})", execution.getCurrentActivityId(),
                    result.getErrorMessage(), execution.getProcessInstanceId());
        }
    }

    /** Giá trị biến người nhận: danh sách, hoặc chuỗi nhiều địa chỉ cách nhau bởi dấu phẩy. */
    private static List<String> addresses(Object value) {
        if (value instanceof Collection<?> collection) {
            return collection.stream().filter(Objects::nonNull).map(String::valueOf)
                    .map(String::trim).filter(item -> !item.isEmpty()).toList();
        }
        if (value == null) {
            return List.of();
        }
        return Arrays.stream(String.valueOf(value).split(","))
                .map(String::trim).filter(item -> !item.isEmpty()).toList();
    }
}
