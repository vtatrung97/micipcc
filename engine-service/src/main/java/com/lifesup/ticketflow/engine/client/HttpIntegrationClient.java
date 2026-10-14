package com.lifesup.ticketflow.engine.client;

import com.lifesup.ticketflow.auth.config.InternalApiKeys;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendRequest;
import com.lifesup.ticketflow.engine.client.dto.NotificationSendResult;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteRequest;
import com.lifesup.ticketflow.engine.client.dto.OperationExecuteResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Gọi integration-service qua HTTP, xác thực bằng X-API-Key của integration-service.
 *
 * <pre>
 *  POST /internal/v1/operations/{apiId}/execute   body OperationExecuteRequest → ApiResponse&lt;OperationExecuteResult&gt;
 *  POST /internal/v1/notifications                body NotificationSendRequest → ApiResponse&lt;NotificationSendResult&gt;
 * </pre>
 * Hai API này là hợp đồng engine đề xuất, integration-service cần cài đặt theo.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.integration", name = "mode", havingValue = "http", matchIfMissing = true)
public class HttpIntegrationClient implements IntegrationClient {
    static final String EXECUTE_PATH = "/internal/v1/operations/{apiId}/execute";
    static final String NOTIFICATION_PATH = "/internal/v1/notifications";

    private final RestClient restClient;

    public HttpIntegrationClient(RestClient.Builder builder, IntegrationProperties properties,
            InternalApiKeys internalApiKeys, @Value("${app.api-key.header-name:X-API-Key}") String apiKeyHeader) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getConnectTimeout());
        requestFactory.setReadTimeout(properties.getReadTimeout());

        String apiKey = internalApiKeys.get(properties.getServiceName());
        if (apiKey == null) {
            log.warn("No internal API key for {}: calls will be rejected", properties.getServiceName());
        }
        RestClient.Builder configured = builder.baseUrl(properties.getBaseUrl()).requestFactory(requestFactory);
        if (apiKey != null) {
            configured = configured.defaultHeader(apiKeyHeader, apiKey);
        }
        this.restClient = configured.build();
    }

    @Override
    public OperationExecuteResult executeOperation(String apiId, OperationExecuteRequest request) {
        try {
            ApiResponse<OperationExecuteResult> response = restClient.post()
                    .uri(EXECUTE_PATH, apiId)
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<OperationExecuteResult>>() {
                    });
            return requireResult(response, "execute " + apiId);
        } catch (RestClientException exception) {
            throw new IntegrationException("Call integration-service failed: execute " + apiId, exception);
        }
    }

    @Override
    public NotificationSendResult sendNotification(NotificationSendRequest request) {
        try {
            ApiResponse<NotificationSendResult> response = restClient.post()
                    .uri(NOTIFICATION_PATH)
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<NotificationSendResult>>() {
                    });
            return requireResult(response, "send notification");
        } catch (RestClientException exception) {
            throw new IntegrationException("Call integration-service failed: send notification", exception);
        }
    }

    private static <T> T requireResult(ApiResponse<T> response, String action) {
        if (response == null || response.getResult() == null) {
            throw new IntegrationException("Empty response from integration-service: " + action);
        }
        return response.getResult();
    }
}
