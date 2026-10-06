package com.lifesup.ticketflow.auth.filter;

import com.lifesup.ticketflow.auth.config.InternalApiKeys;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Slf4j
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    /** Key chỉ xác định service nhận, không biết service gọi, nên mọi lời gọi nội bộ có chung principal này. */
    static final String INTERNAL_CLIENT = "internal";

    private final String headerName;
    private final byte[] ownKeyHash;
    private final AuthenticationErrorWriter errorWriter;
    private final org.springframework.security.web.util.matcher.RequestMatcher publicEndpoints;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    public ApiKeyAuthenticationFilter(
            String headerName,
            InternalApiKeys apiKeys,
            String applicationName,
            AuthenticationErrorWriter errorWriter,
            org.springframework.security.web.util.matcher.RequestMatcher publicEndpoints) {
        String ownKey = apiKeys.get(applicationName);
        this.headerName = headerName;
        this.ownKeyHash = ownKey == null ? null : sha256(ownKey);
        this.errorWriter = errorWriter;
        this.publicEndpoints = publicEndpoints;
        if (ownKey == null) {
            log.warn("No internal API key for {}: requests with header {} will be rejected", applicationName, headerName);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return publicEndpoints.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String apiKey = request.getHeader(headerName);
        if (!StringUtils.hasText(apiKey)) {
            chain.doFilter(request, response);
            return;
        }

        if (ownKeyHash == null || !MessageDigest.isEqual(ownKeyHash, sha256(apiKey))) {
            log.warn("Invalid API key: {} {} from {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
            securityContextHolderStrategy.clearContext();
            errorWriter.write(request, response, ErrorCode.INVALID_API_KEY);
            return;
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(new ApiKeyAuthenticationToken(INTERNAL_CLIENT));
        securityContextHolderStrategy.setContext(context);
        chain.doFilter(request, response);
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /**
     * Authentication của service nội bộ: principal là {@code internal}, quyền ROLE_SERVICE.
     * API chỉ cho service nội bộ gọi: {@code @PreAuthorize("hasRole('SERVICE')")}.
     */
    public static class ApiKeyAuthenticationToken extends AbstractAuthenticationToken {

        public static final String ROLE_SERVICE = "ROLE_SERVICE";

        private final String clientId;

        public ApiKeyAuthenticationToken(String clientId) {
            super(AuthorityUtils.createAuthorityList(ROLE_SERVICE));
            this.clientId = clientId;
            setAuthenticated(true);
        }

        @Override
        public Object getCredentials() {
            return null;
        }

        @Override
        public Object getPrincipal() {
            return clientId;
        }
    }
}
