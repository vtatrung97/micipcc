package com.lifesup.ticketflow.auth.service;

import org.keycloak.representations.AccessToken;

/** Provider-neutral contract used by the bearer authentication filter. */
@FunctionalInterface
public interface AccessTokenVerifier {
    AccessToken verifyToken(String token);
}
