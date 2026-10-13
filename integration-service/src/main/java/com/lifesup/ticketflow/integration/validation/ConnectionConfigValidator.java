package com.lifesup.ticketflow.integration.validation;

import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.dto.data.AuthConfigData;
import com.lifesup.ticketflow.integration.dto.data.SecretData;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Kiểm tra cấu hình connection ngoài phần annotation của DTO: endpoint gốc và các field bắt buộc
 * của authConfig / secret theo authType.
 */
@Component
public class ConnectionConfigValidator {

    /**
     * Endpoint gốc: URL tuyệt đối http/https, có host, không có query.
     *
     * @return URL đã bỏ dấu / ở cuối để nối với path của API
     */
    public String normalizeBaseUrl(String baseUrl) {
        try {
            URI uri = new URI(baseUrl.trim());
            String scheme = uri.getScheme();
            boolean http = "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
            if (!http || !StringUtils.hasText(uri.getHost()) || uri.getRawQuery() != null) {
                throw new AppException(IntegrationErrorCode.CONNECTION_BASE_URL_INVALID);
            }
        } catch (URISyntaxException e) {
            throw new AppException(IntegrationErrorCode.CONNECTION_BASE_URL_INVALID);
        }
        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    /** API_KEY cần headerName, BASIC cần username, OAUTH2_CLIENT_CREDENTIALS cần tokenUrl + clientId. */
    public void validateAuthConfig(AuthType authType, AuthConfigData config) {
        AuthConfigData value = config != null ? config : new AuthConfigData();
        switch (authType) {
            case API_KEY -> require(value.getHeaderName(), "authConfig.headerName");
            case BASIC -> require(value.getUsername(), "authConfig.username");
            case OAUTH2_CLIENT_CREDENTIALS -> {
                require(value.getTokenUrl(), "authConfig.tokenUrl");
                require(value.getClientId(), "authConfig.clientId");
            }
            default -> {
                // NONE, BEARER: không cần cấu hình
            }
        }
    }

    /** API_KEY cần apiKey, BASIC cần password, BEARER cần token, OAUTH2_CLIENT_CREDENTIALS cần clientSecret. */
    public void validateSecret(AuthType authType, SecretData secret) {
        SecretData value = secret != null ? secret : new SecretData();
        switch (authType) {
            case API_KEY -> require(value.getApiKey(), "secret.apiKey");
            case BASIC -> require(value.getPassword(), "secret.password");
            case BEARER -> require(value.getToken(), "secret.token");
            case OAUTH2_CLIENT_CREDENTIALS -> require(value.getClientSecret(), "secret.clientSecret");
            default -> {
                // NONE: không có secret
            }
        }
    }

    private static void require(String value, String field) {
        if (!StringUtils.hasText(value)) {
            throw AppException.withArgs(IntegrationErrorCode.CONNECTION_AUTH_CONFIG_INVALID, field);
        }
    }
}
