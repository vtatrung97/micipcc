package com.lifesup.ticketflow.engine.client;

import com.lifesup.ticketflow.engine.client.dto.NotificationSendRequest;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendResult;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteRequest;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteResult;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Bản giả lập dùng khi integration-service chưa có API (app.integration.mode=stub): không gọi ra ngoài,
 * luôn thành công với kết quả rỗng. Không dùng ở môi trường thật.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.integration", name = "mode", havingValue = "stub")
public class StubIntegrationClient implements IntegrationClient {

    @Override
    public OperationExecuteResult executeOperation(String apiId, OperationExecuteRequest request) {
        log.info("[stub] execute {} for process instance {}", apiId, request.getContext().getProcessInstanceId());
        return OperationExecuteResult.success(Map.of());
    }

    @Override
    public NotificationSendResult sendNotification(NotificationSendRequest request) {
        log.info("[stub] send {} notification for process instance {}", request.getChannel(),
                request.getContext().getProcessInstanceId());
        return NotificationSendResult.ok();
    }
}
