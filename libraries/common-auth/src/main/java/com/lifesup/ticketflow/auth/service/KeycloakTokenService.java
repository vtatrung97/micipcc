package com.lifesup.ticketflow.auth.service;

import com.lifesup.ticketflow.auth.dto.OAuthTokenResponse;

/** Reusable client for Keycloak OAuth2 and UMA token operations. */
public interface KeycloakTokenService {

    OAuthTokenResponse login(String username, String password);

    OAuthTokenResponse refresh(String refreshToken);

    /** Exchanges a user's access token for an RPT containing authorization.permissions. */
    OAuthTokenResponse requestRpt(String accessToken);

    void logout(String refreshToken);
}
