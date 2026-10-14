package com.lifesup.ticketflow.engine.client;

import com.lifesup.ticketflow.engine.client.dto.NotificationSendRequest;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendResult;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteRequest;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteResult;

/**
 * Gọi integration-service. Lỗi kỹ thuật ném {@link IntegrationException} để async executor của Flowable thử lại;
 * lỗi nghiệp vụ trả về trong kết quả để quy trình đi nhánh error.
 */
public interface IntegrationClient {

    OperationExecuteResult executeOperation(String apiId, OperationExecuteRequest request);

    NotificationSendResult sendNotification(NotificationSendRequest request);
}
