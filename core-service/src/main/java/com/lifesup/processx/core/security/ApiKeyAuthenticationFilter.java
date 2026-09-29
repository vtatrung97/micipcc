package com.lifesup.processx.core.security;

import com.lifesup.processx.core.exception.ErrorCode;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Bước (1) trong luồng xác thực (xem {@link SecurityConfig}): service nội bộ gọi nhau bằng header X-API-Key.
 *
 * <pre>
 *  endpoint public                → bỏ qua filter
 *  không có header X-API-Key      → đi tiếp, để KeycloakAuthenticationFilter kiểm Bearer token
 *  có header, key khớp cấu hình   → SecurityContext = ApiKeyAuthenticationToken(clientId, ROLE_SERVICE), đi tiếp
 *  có header, key sai             → trả 401 INVALID_API_KEY, dừng (không thử sang Bearer token)
 * </pre>
 *
 * Danh sách key lấy từ {@code app.api-key.keys} dạng {@code clientId:key,clientId:key} (key tối thiểu 32 ký tự).
 * Chỉ giữ hash SHA-256 của key trong bộ nhớ, so sánh theo thời gian hằng để tránh timing attack.
 */
@Slf4j
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    static final int MIN_KEY_LENGTH = 32;

    private final String headerName;
    private final List<ApiKeyEntry> apiKeys;
    private final SecurityConfig.ErrorWriter errorWriter;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    ApiKeyAuthenticationFilter(String headerName, String keysConfig, SecurityConfig.ErrorWriter errorWriter) {
        this.headerName = headerName;
        this.apiKeys = parseKeys(keysConfig);
        this.errorWriter = errorWriter;
        log.info("Loaded {} API key client(s): {}", apiKeys.size(), apiKeys.stream().map(ApiKeyEntry::clientId).toList());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return SecurityConfig.PUBLIC_ENDPOINTS.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String apiKey = request.getHeader(headerName);
        if (!StringUtils.hasText(apiKey)) {
            chain.doFilter(request, response);
            return;
        }

        String clientId = findClientId(apiKey);
        if (clientId == null) {
            log.warn("Invalid API key: {} {} from {}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
            securityContextHolderStrategy.clearContext();
            errorWriter.write(request, response, ErrorCode.INVALID_API_KEY);
            return;
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(new ApiKeyAuthenticationToken(clientId));
        securityContextHolderStrategy.setContext(context);
        chain.doFilter(request, response);
    }

    /** Trả về clientId tương ứng với key, null nếu key không hợp lệ. */
    private String findClientId(String rawKey) {
        byte[] candidate = sha256(rawKey);
        String matched = null;
        // Duyệt hết danh sách, không dừng sớm, để thời gian xử lý không phụ thuộc vị trí key
        for (ApiKeyEntry entry : apiKeys) {
            if (MessageDigest.isEqual(entry.keyHash(), candidate) && matched == null) {
                matched = entry.clientId();
            }
        }
        return matched;
    }

    private static List<ApiKeyEntry> parseKeys(String config) {
        List<ApiKeyEntry> result = new ArrayList<>();
        if (!StringUtils.hasText(config)) {
            return result;
        }
        for (String item : config.split(",")) {
            String trimmed = item.trim();
            int separator = trimmed.indexOf(':');
            if (separator <= 0 || separator == trimmed.length() - 1) {
                if (!trimmed.isEmpty()) {
                    log.warn("Ignoring malformed API key entry (expected clientId:key)");
                }
                continue;
            }
            String clientId = trimmed.substring(0, separator).trim();
            String key = trimmed.substring(separator + 1).trim();
            if (key.length() < MIN_KEY_LENGTH) {
                log.warn("Ignoring API key for client {}: key must be at least {} characters long", clientId, MIN_KEY_LENGTH);
                continue;
            }
            result.add(new ApiKeyEntry(clientId, sha256(key)));
        }
        return List.copyOf(result);
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private record ApiKeyEntry(String clientId, byte[] keyHash) {}

    /**
     * Authentication của service nội bộ: principal là clientId (VD integration-service), quyền ROLE_SERVICE.
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
