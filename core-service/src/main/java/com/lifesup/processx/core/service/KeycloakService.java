package com.lifesup.processx.core.service;

import org.keycloak.representations.AccessToken;
import org.keycloak.representations.AccessTokenResponse;

/**
 * Gọi Keycloak qua thư viện Keycloak (KeycloakBuilder/TokenService) bằng client confidential {@code keycloak.client-id}.
 * Keycloak trả 4xx/5xx: ném KeycloakClientException; không kết nối được: ném AppException KEYCLOAK_UNAVAILABLE.
 */
public interface KeycloakService {

    AccessTokenResponse login(String username, String password);

    AccessTokenResponse refreshToken(String refreshToken);

    /** Kết thúc session Keycloak gắn với refresh token. */
    void logout(String refreshToken);

    /**
     * Kiểm tra access token trực tiếp với Keycloak (introspection).
     * Token hết hạn, đã logout hoặc user bị khoá: ném AppException UNAUTHENTICATED.
     */
    AccessToken verifyToken(String token);
}
