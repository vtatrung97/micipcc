package com.lifesup.ticketflow.auth.exception;

import lombok.Getter;

/** Keycloak trả về HTTP 4xx/5xx, kèm mã lỗi OAuth2 (VD: invalid_grant, unauthorized_client). */
@Getter
public class KeycloakClientException extends RuntimeException {

    private final int status;
    private final String error;
    private final String errorDescription;

    public KeycloakClientException(int status, String error, String errorDescription) {
        super("Keycloak responded " + status + " " + error + ": " + errorDescription);
        this.status = status;
        this.error = error;
        this.errorDescription = errorDescription;
    }

    public boolean isServerError() {
        return status >= 500;
    }
}
