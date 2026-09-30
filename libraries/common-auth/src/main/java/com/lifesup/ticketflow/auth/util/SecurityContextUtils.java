package com.lifesup.ticketflow.auth.util;

import com.lifesup.ticketflow.auth.filter.ApiKeyAuthenticationFilter.ApiKeyAuthenticationToken;
import com.lifesup.ticketflow.auth.filter.KeycloakAuthenticationFilter.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Truy cập thông tin người dùng/service đang gọi API từ SecurityContext. */
public final class SecurityContextUtils {

    private SecurityContextUtils() {}

    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /** Authentication của người dùng Keycloak; ném ClassCastException nếu request gọi bằng X-API-Key. */
    public static KeycloakAuthenticationToken getAuthentication() {
        return (KeycloakAuthenticationToken) getCurrentAuthentication();
    }

    public static AccessToken getAccessToken() {
        return getAuthentication().getAccessToken();
    }

    /** Chuỗi access token gốc, dùng khi cần chuyển tiếp sang service khác. */
    public static String getTokenString() {
        return getAuthentication().getTokenString();
    }

    /** Keycloak user id (claim sub). */
    public static String getUserId() {
        return getAccessToken().getSubject();
    }

    public static String getUsername() {
        return getAccessToken().getPreferredUsername();
    }

    /** clientId của service gọi bằng X-API-Key. */
    public static String getApiKeyClientId() {
        return ((ApiKeyAuthenticationToken) getCurrentAuthentication()).getName();
    }

    public static boolean checkAnonymousAuthentication() {
        Authentication authentication = getCurrentAuthentication();
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    public static boolean isKeycloakAuthenticationToken() {
        return getCurrentAuthentication() instanceof KeycloakAuthenticationToken;
    }

    public static boolean isApiKeyAuthenticationToken() {
        return getCurrentAuthentication() instanceof ApiKeyAuthenticationToken;
    }
}
