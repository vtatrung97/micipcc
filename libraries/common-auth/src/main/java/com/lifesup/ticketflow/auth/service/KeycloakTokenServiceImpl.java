package com.lifesup.ticketflow.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.auth.config.CommonAuthProperties;
import com.lifesup.ticketflow.auth.dto.OAuthTokenResponse;
import com.lifesup.ticketflow.auth.exception.KeycloakClientException;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.function.Supplier;

@Slf4j
public class KeycloakTokenServiceImpl implements KeycloakTokenService {

    private static final String PASSWORD_GRANT = "password";
    private static final String REFRESH_TOKEN_GRANT = "refresh_token";
    private static final String UMA_TICKET_GRANT = "urn:ietf:params:oauth:grant-type:uma-ticket";

    private final CommonAuthProperties.TokenClient properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public KeycloakTokenServiceImpl(
            CommonAuthProperties.TokenClient properties,
            RestClient restClient,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public OAuthTokenResponse login(String username, String password) {
        MultiValueMap<String, String> form = clientForm();
        form.add("grant_type", PASSWORD_GRANT);
        form.add("username", username);
        form.add("password", password);
        form.add("scope", "openid");
        return tokenRequest(form, null);
    }

    @Override
    public OAuthTokenResponse refresh(String refreshToken) {
        MultiValueMap<String, String> form = clientForm();
        form.add("grant_type", REFRESH_TOKEN_GRANT);
        form.add("refresh_token", refreshToken);
        return tokenRequest(form, null);
    }

    @Override
    public OAuthTokenResponse requestRpt(String accessToken) {
        // The user's access token is the client authentication method for an UMA grant.
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", UMA_TICKET_GRANT);
        form.add("audience", properties.getAudience());
        return tokenRequest(form, accessToken);
    }

    @Override
    public void logout(String refreshToken) {
        MultiValueMap<String, String> form = clientForm();
        form.add("refresh_token", refreshToken);
        call(() -> {
            restClient.post()
                    .uri(logoutPath())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
            return null;
        });
    }

    private OAuthTokenResponse tokenRequest(MultiValueMap<String, String> form, String bearerToken) {
        return call(() -> {
            RestClient.RequestBodySpec request = restClient.post()
                    .uri(tokenPath())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED);
            if (StringUtils.hasText(bearerToken)) {
                request.header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken);
            }
            OAuthTokenResponse response = request.body(form).retrieve().body(OAuthTokenResponse.class);
            if (response == null || !StringUtils.hasText(response.accessToken())) {
                throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE);
            }
            return response;
        });
    }

    private MultiValueMap<String, String> clientForm() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", properties.getClientId());
        if (StringUtils.hasText(properties.getClientSecret())) {
            form.add("client_secret", properties.getClientSecret());
        }
        return form;
    }

    private String tokenPath() {
        return "/realms/" + properties.getRealm() + "/protocol/openid-connect/token";
    }

    private String logoutPath() {
        return "/realms/" + properties.getRealm() + "/protocol/openid-connect/logout";
    }

    private <T> T call(Supplier<T> request) {
        try {
            return request.get();
        } catch (RestClientResponseException exception) {
            throw toKeycloakException(exception);
        } catch (RestClientException exception) {
            log.error("Failed to call Keycloak: {}", exception.getMessage());
            throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE, exception);
        }
    }

    private KeycloakClientException toKeycloakException(RestClientResponseException exception) {
        String error = null;
        String description = null;
        try {
            JsonNode body = objectMapper.readTree(exception.getResponseBodyAsByteArray());
            error = text(body, "error");
            description = text(body, "error_description");
        } catch (Exception ignored) {
            // Keycloak/proxy may return an empty or non-JSON error body.
        }
        return new KeycloakClientException(exception.getStatusCode().value(), error, description);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node == null ? null : node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }
}
