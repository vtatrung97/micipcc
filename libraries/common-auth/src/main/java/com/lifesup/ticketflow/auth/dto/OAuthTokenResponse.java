package com.lifesup.ticketflow.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/** OAuth2 token endpoint response returned for login, refresh and UMA RPT grants. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OAuthTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("refresh_expires_in") Long refreshExpiresIn,
        String scope) {
}
