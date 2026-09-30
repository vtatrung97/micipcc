package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.core.dto.request.LoginRequest;
import com.lifesup.ticketflow.core.dto.response.CurrentUserResponse;
import com.lifesup.ticketflow.core.dto.response.TokenResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.auth.exception.KeycloakClientException;
import com.lifesup.ticketflow.core.service.AuthenticationService;
import com.lifesup.ticketflow.core.service.KeycloakService;
import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.AccessToken;
import org.keycloak.representations.AccessTokenResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {

    private static final String INVALID_GRANT = "invalid_grant";

    KeycloakService keycloakService;

    @Override
    public TokenResponse login(LoginRequest request) {
        try {
            AccessTokenResponse token = keycloakService.login(request.getUsername(), request.getPassword());
            log.info("User {} logged in", request.getUsername());
            return toResponse(token);
        } catch (KeycloakClientException e) {
            log.warn("Login failed for user {}: {}", request.getUsername(), e.getMessage());
            throw new AppException(mapLoginError(e));
        }
    }

    @Override
    public TokenResponse refreshToken(String refreshToken) {
        try {
            return toResponse(keycloakService.refreshToken(refreshToken));
        } catch (KeycloakClientException e) {
            log.warn("Refresh token failed: {}", e.getMessage());
            throw new AppException(mapTokenError(e, ErrorCode.INVALID_REFRESH_TOKEN));
        }
    }

    @Override
    public void logout(String refreshToken) {
        try {
            keycloakService.logout(refreshToken);
        } catch (KeycloakClientException e) {
            // Session đã hết hạn/đã logout trước đó thì coi như logout thành công
            if (!INVALID_GRANT.equals(e.getError())) {
                throw new AppException(mapTokenError(e, ErrorCode.INVALID_REFRESH_TOKEN));
            }
        }
    }

    @Override
    public CurrentUserResponse currentUser() {
        // Khi app.security.enabled=false, request không có người dùng (anonymous)
        if (SecurityContextUtils.checkAnonymousAuthentication()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        List<String> authorities = SecurityContextUtils.getCurrentAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        if (SecurityContextUtils.isApiKeyAuthenticationToken()) {
            String clientId = SecurityContextUtils.getApiKeyClientId();
            return CurrentUserResponse.builder()
                    .authType("API_KEY")
                    .subject(clientId)
                    .username(clientId)
                    .authorities(authorities)
                    .build();
        }

        AccessToken accessToken = SecurityContextUtils.getAccessToken();
        return CurrentUserResponse.builder()
                .authType("KEYCLOAK")
                .subject(accessToken.getSubject())
                .username(accessToken.getPreferredUsername())
                .fullName(accessToken.getName())
                .email(accessToken.getEmail())
                .authorities(authorities)
                .build();
    }

    private ErrorCode mapLoginError(KeycloakClientException e) {
        if (isClientConfigError(e)) {
            return configurationError(e);
        }
        if (e.isServerError()) {
            return ErrorCode.KEYCLOAK_UNAVAILABLE;
        }
        String description = e.getErrorDescription() == null ? "" : e.getErrorDescription().toLowerCase(Locale.ROOT);
        if (description.contains("disabled")) {
            return ErrorCode.ACCOUNT_DISABLED;
        }
        if (description.contains("not fully set up")) {
            return ErrorCode.ACCOUNT_NOT_READY;
        }
        return ErrorCode.INVALID_CREDENTIALS;
    }

    private static ErrorCode mapTokenError(KeycloakClientException e, ErrorCode clientErrorCode) {
        if (isClientConfigError(e)) {
            return configurationError(e);
        }
        return e.isServerError() ? ErrorCode.KEYCLOAK_UNAVAILABLE : clientErrorCode;
    }

    /** Sai client id/secret hoặc client chưa bật Direct Access Grants: lỗi cấu hình phía hệ thống, không phải lỗi người dùng. */
    private static boolean isClientConfigError(KeycloakClientException e) {
        String error = e.getError();
        return "invalid_client".equals(error)
                || "unauthorized_client".equals(error)
                || "unsupported_grant_type".equals(error);
    }

    private static ErrorCode configurationError(KeycloakClientException e) {
        log.error("Invalid Keycloak client configuration: {}", e.getMessage());
        return ErrorCode.KEYCLOAK_CONFIGURATION_ERROR;
    }

    private static TokenResponse toResponse(AccessTokenResponse token) {
        return TokenResponse.builder()
                .accessToken(token.getToken())
                .refreshToken(token.getRefreshToken())
                .tokenType(token.getTokenType())
                .expiresIn(token.getExpiresIn())
                .refreshExpiresIn(token.getRefreshExpiresIn())
                .scope(token.getScope())
                .build();
    }
}
