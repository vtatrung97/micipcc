package com.lifesup.processx.core.security;

import com.lifesup.processx.core.exception.AppException;
import com.lifesup.processx.core.exception.ErrorCode;
import com.lifesup.processx.core.exception.KeycloakClientException;
import com.lifesup.processx.core.service.KeycloakService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.AccessToken;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Bước (2) trong luồng xác thực (xem {@link SecurityConfig}): người dùng/hệ thống ngoài gửi
 * {@code Authorization: Bearer <access token>} do Keycloak cấp.
 *
 * <pre>
 *  endpoint public, hoặc đã xác thực bằng X-API-Key ở bước (1), hoặc không có Bearer → đi tiếp
 *  có Bearer → KeycloakService.verifyToken() hỏi trực tiếp Keycloak (token introspection):
 *     ├─ active=true                         → SecurityContext = KeycloakAuthenticationToken, đi tiếp
 *     ├─ active=false (hết hạn, đã logout,
 *     │   session bị huỷ, user bị khoá)      → 401 UNAUTHENTICATED, dừng
 *     ├─ Keycloak từ chối client (sai secret) → 500 KEYCLOAK_CONFIGURATION_ERROR, dừng
 *     └─ Keycloak lỗi/không phản hồi         → 503 KEYCLOAK_UNAVAILABLE, dừng
 * </pre>
 *
 * Quyền gắn cho người dùng:
 * <ul>
 *   <li>realm role → {@code ROLE_<role>}, dùng {@code hasRole('ADMIN')}</li>
 *   <li>client role của các client trong {@code keycloak.role-clients} → giữ nguyên tên,
 *       dùng {@code hasAuthority('template:view')}; client role của client khác (account...) bị bỏ qua</li>
 * </ul>
 */
@Slf4j
public class KeycloakAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final KeycloakService keycloakService;
    private final List<String> roleClients;
    private final SecurityConfig.ErrorWriter errorWriter;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    KeycloakAuthenticationFilter(
            KeycloakService keycloakService, List<String> roleClients, SecurityConfig.ErrorWriter errorWriter) {
        this.keycloakService = keycloakService;
        this.roleClients = roleClients == null ? List.of() : List.copyOf(roleClients);
        this.errorWriter = errorWriter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return SecurityConfig.PUBLIC_ENDPOINTS.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token == null || securityContextHolderStrategy.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        AccessToken accessToken;
        try {
            accessToken = keycloakService.verifyToken(token);
        } catch (AppException e) {
            // UNAUTHENTICATED (token không active) hoặc KEYCLOAK_UNAVAILABLE (không kết nối được)
            securityContextHolderStrategy.clearContext();
            errorWriter.write(request, response, e.getErrorCode());
            return;
        } catch (KeycloakClientException e) {
            // Keycloak từ chối chính lời gọi introspection (sai client secret...) hoặc trả lỗi 5xx
            log.error("Keycloak introspection failed: {}", e.getMessage());
            securityContextHolderStrategy.clearContext();
            errorWriter.write(request, response, e.isServerError()
                    ? ErrorCode.KEYCLOAK_UNAVAILABLE
                    : ErrorCode.KEYCLOAK_CONFIGURATION_ERROR);
            return;
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(new KeycloakAuthenticationToken(accessToken, token, authoritiesOf(accessToken)));
        securityContextHolderStrategy.setContext(context);
        chain.doFilter(request, response);
    }

    private static String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
            return null;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return StringUtils.hasText(token) ? token : null;
    }

    private Set<GrantedAuthority> authoritiesOf(AccessToken accessToken) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        if (accessToken.getRealmAccess() != null && accessToken.getRealmAccess().getRoles() != null) {
            accessToken.getRealmAccess().getRoles()
                    .forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
        }
        for (String client : roleClients) {
            AccessToken.Access access = accessToken.getResourceAccess(client);
            if (access != null && access.getRoles() != null) {
                access.getRoles().forEach(role -> authorities.add(new SimpleGrantedAuthority(role)));
            }
        }
        return authorities;
    }

    /**
     * Authentication của người dùng Keycloak: giữ {@link AccessToken} đã được Keycloak xác nhận và chuỗi token gốc
     * (để chuyển tiếp khi gọi sang service khác). Lấy trong code qua SecurityContextUtils.
     */
    @Getter
    public static class KeycloakAuthenticationToken extends AbstractAuthenticationToken {

        private final AccessToken accessToken;
        private final String tokenString;

        public KeycloakAuthenticationToken(
                AccessToken accessToken, String tokenString, Collection<? extends GrantedAuthority> authorities) {
            super(authorities);
            this.accessToken = accessToken;
            this.tokenString = tokenString;
            setAuthenticated(true);
        }

        /** Username (preferred_username), fallback Keycloak user id (sub). */
        @Override
        public Object getPrincipal() {
            String username = accessToken.getPreferredUsername();
            return StringUtils.hasText(username) ? username : accessToken.getSubject();
        }

        @Override
        public Object getCredentials() {
            return tokenString;
        }
    }
}
