package com.lifesup.ticketflow.engine.node.notification;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.node.notification.NotificationNodeConfig.RecipientSource;
import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/** NOTIFICATION → service task bất đồng bộ gọi NotificationDelegate. */
@Component
public class NotificationNodeHandler extends NodeHandler<NotificationNodeConfig> {

    public NotificationNodeHandler() {
        super(NotificationNodeConfig.class, NodeType.NOTIFICATION);
    }

    @Override
    public void validate(NotificationNodeConfig config, NodeCheck check) {
        if (config.getChannel() == null) {
            check.error(ValidationCode.NOTIFICATION_CHANNEL_REQUIRED, "config.channel", "Chưa chọn kênh gửi");
        }
        if (config.getRecipientSource() == null) {
            check.error(ValidationCode.NOTIFICATION_RECIPIENT_SOURCE_REQUIRED, "config.recipientSource",
                    "Chưa chọn nguồn người nhận");
        } else if (config.getRecipientSource() == RecipientSource.VARIABLE) {
            check.requireDeclared("config.recipientVariable", config.getRecipientVariable());
        } else if (config.getRecipientUserIds().isEmpty()) {
            check.error(ValidationCode.NOTIFICATION_RECIPIENT_REQUIRED, "config.recipientUserIds",
                    "Cần chọn ít nhất một người nhận");
        }
        if (isBlank(config.getContent())) {
            check.error(ValidationCode.NOTIFICATION_CONTENT_REQUIRED, "config.content", "Thiếu nội dung thông báo");
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, NotificationNodeConfig config, ConversionContext context) {
        ServiceTask task = init(new ServiceTask(), node, context);
        delegateTo(task, NotificationDelegate.BEAN);
        task.setAsynchronous(true);
        return ConvertedNode.single(task);
    }
}
