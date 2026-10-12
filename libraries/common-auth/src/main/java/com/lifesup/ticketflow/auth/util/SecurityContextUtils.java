package com.lifesup.ticketflow.auth.util;

import com.lifesup.ticketflow.auth.filter.ApiKeyAuthenticationFilter.ApiKeyAuthenticationToken;
import org.keycloak.AuthorizationContext;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Access to the user, roles and RPT permissions stored in the current SecurityContext. */
public final class SecurityContextUtils {

    private static final String REALMS_PATH = "/realms/";

    private SecurityContextUtils() {}

    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static Jwt getJwt() {
        if (getCurrentAuthentication() instanceof JwtAuthenticationToken authentication) {
            return authentication.getToken();
        }
        throw new IllegalStateException("Current request is not authenticated with a JWT/RPT");
    }

    public static String getTokenString() {
        return getJwt().getTokenValue();
    }

    public static String getUserId() {
        return getJwt().getSubject();
    }

    public static String getUsername() {
        String username = getJwt().getClaimAsString("preferred_username");
        return StringUtils.hasText(username) ? username : getJwt().getSubject();
    }

    public static String getFullName() {
        return getJwt().getClaimAsString("name");
    }

    public static String getEmail() {
        return getJwt().getClaimAsString("email");
    }

    /**
     * Realm Keycloak của token hiện tại, lấy từ claim iss ({@code https://host/realms/<realm>}
     * hoặc {@code https://host/auth/realms/<realm>}). Không phải JWT (API key, job nền) hoặc không đọc được thì null.
     */
    public static String getRealm() {
        if (!isJwtAuthenticationToken()) {
            return null;
        }
        String issuer = getJwt().getClaimAsString("iss");
        if (!StringUtils.hasText(issuer)) {
            return null;
        }
        int index = issuer.lastIndexOf(REALMS_PATH);
        if (index < 0) {
            return null;
        }
        String realm = issuer.substring(index + REALMS_PATH.length());
        int slash = realm.indexOf('/');
        realm = slash >= 0 ? realm.substring(0, slash) : realm;
        return StringUtils.hasText(realm) ? realm : null;
    }

    public static String getApiKeyClientId() {
        return ((ApiKeyAuthenticationToken) getCurrentAuthentication()).getName();
    }

    public static boolean checkAnonymousAuthentication() {
        Authentication authentication = getCurrentAuthentication();
        return authentication == null || authentication instanceof AnonymousAuthenticationToken;
    }

    public static boolean isJwtAuthenticationToken() {
        return getCurrentAuthentication() instanceof JwtAuthenticationToken;
    }

    public static boolean isApiKeyAuthenticationToken() {
        return getCurrentAuthentication() instanceof ApiKeyAuthenticationToken;
    }

    /** Checks Keycloak RPT authorization.permissions by resource name/id and scope. */
    public static boolean checkPermission(String resourceName, String scope) {
        if (!isJwtAuthenticationToken() || !StringUtils.hasText(resourceName)) {
            return false;
        }
        AuthorizationContext authzContext = getAuthorizationContext();
        if (authzContext != null && authzContext.hasPermission(resourceName, StringUtils.hasText(scope) ? scope : null)) {
            return true;
        }
        return permissions().stream().anyMatch(permission -> resourceMatches(permission, resourceName)
                && (!StringUtils.hasText(scope) || scopes(permission).contains(scope)));
    }

    public static boolean checkScopePermission(String scope) {
        if (!isJwtAuthenticationToken() || !StringUtils.hasText(scope)) {
            return false;
        }
        AuthorizationContext authzContext = getAuthorizationContext();
        if (authzContext != null && authzContext.hasScopePermission(scope)) {
            return true;
        }
        return permissions().stream().anyMatch(permission -> scopes(permission).contains(scope));
    }

    /**
     * Keycloak permissions (RPT) granted by PolicyEnforcerFilter for the current request, like
     * KeycloakSecurityContext#getAuthorizationContext of the legacy adapter. Null outside a request
     * or on paths the enforcer skipped.
     */
    public static AuthorizationContext getAuthorizationContext() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        Object authzContext = attributes.getAttribute(
                AuthorizationContext.class.getName(), RequestAttributes.SCOPE_REQUEST);
        return authzContext instanceof AuthorizationContext context ? context : null;
    }

    /** Checks the top-level OAuth/OIDC scope claim, not UMA permission scopes. */
    public static boolean hasOAuthScope(String scope) {
        if (!isJwtAuthenticationToken() || !StringUtils.hasText(scope)) {
            return false;
        }
        Object tokenScopes = getJwt().getClaims().get("scope");
        if (tokenScopes instanceof Collection<?> collection) {
            return collection.contains(scope);
        }
        return tokenScopes instanceof String value && splitScopes(value).contains(scope);
    }

    public static boolean hasRealmRole(String role) {
        return isJwtAuthenticationToken()
                && roles(map(getJwt().getClaims().get("realm_access"))).contains(role);
    }

    public static boolean hasClientRole(String clientId, String role) {
        if (!isJwtAuthenticationToken()) {
            return false;
        }
        Object clientAccess = map(getJwt().getClaims().get("resource_access")).get(clientId);
        return roles(map(clientAccess)).contains(role);
    }

    private static List<Map<String, Object>> permissions() {
        Object permissions = map(getJwt().getClaims().get("authorization")).get("permissions");
        if (!(permissions instanceof Collection<?> collection)) {
            return List.of();
        }
        return collection.stream().filter(Map.class::isInstance).map(SecurityContextUtils::map).toList();
    }

    private static boolean resourceMatches(Map<String, Object> permission, String resourceName) {
        return equalsIgnoreCase(resourceName, permission.get("rsname"))
                || equalsIgnoreCase(resourceName, permission.get("rsid"));
    }

    private static List<String> scopes(Map<String, Object> permission) {
        return strings(permission.get("scopes"));
    }

    private static List<String> roles(Map<String, Object> claims) {
        return strings(claims.get("roles"));
    }

    private static List<String> strings(Object value) {
        if (!(value instanceof Collection<?> collection)) {
            return List.of();
        }
        return collection.stream().filter(String.class::isInstance).map(String.class::cast).toList();
    }

    private static List<String> splitScopes(String scopes) {
        return StringUtils.hasText(scopes) ? List.of(scopes.trim().split("\\s+")) : List.of();
    }

    private static Map<String, Object> map(Object value) {
        if (!(value instanceof Map<?, ?> source)) {
            return Map.of();
        }
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, mapValue) -> {
            if (key instanceof String stringKey) {
                result.put(stringKey, mapValue);
            }
        });
        return result;
    }

    private static boolean equalsIgnoreCase(String expected, Object actual) {
        return actual instanceof String value && expected.equalsIgnoreCase(value);
    }
}
