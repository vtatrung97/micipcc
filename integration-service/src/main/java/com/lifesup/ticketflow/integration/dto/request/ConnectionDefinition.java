package com.lifesup.ticketflow.integration.dto.request;

import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.dto.data.AuthConfigData;
import com.lifesup.ticketflow.integration.dto.data.CircuitBreakerConfigData;
import com.lifesup.ticketflow.integration.dto.data.SecretData;

/** Phần cấu hình kết nối dùng chung giữa request tạo và sửa connection. */
public interface ConnectionDefinition {

    String getName();

    Protocol getProtocol();

    String getBaseUrl();

    AuthType getAuthType();

    AuthConfigData getAuthConfig();

    SecretData getSecret();

    Integer getTimeoutMs();

    Integer getRateLimitPerSecond();

    CircuitBreakerConfigData getCircuitBreakerConfig();
}
