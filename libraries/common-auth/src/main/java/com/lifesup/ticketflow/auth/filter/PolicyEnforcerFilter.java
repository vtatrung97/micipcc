package com.lifesup.ticketflow.auth.filter;

import com.lifesup.ticketflow.auth.config.PathBasedConfigResolver;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.AuthorizationContext;
import org.keycloak.adapters.authorization.PolicyEnforcer;
import org.keycloak.adapters.authorization.TokenPrincipal;
import org.keycloak.adapters.authorization.integration.elytron.ServletHttpRequest;
import org.keycloak.adapters.authorization.integration.elytron.ServletHttpResponse;
import org.keycloak.representations.adapters.config.PolicyEnforcerConfig;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enforces the Keycloak resource/scope permissions of the policy-enforcer config after Spring Security
 * has validated the bearer JWT.
 *
 * <pre>
 *  OPTIONS / endpoint public          → bỏ qua filter
 *  chưa xác thực bằng JWT             → bỏ qua, để Spring Security trả 401
 *  Keycloak cho phép                  → đi tiếp
 *  Keycloak từ chối (401/403)         → trả lỗi chuẩn ApiResponse, dừng
 * </pre>
 */
@Slf4j
public class PolicyEnforcerFilter extends OncePerRequestFilter {

    private final PathBasedConfigResolver configResolver;
    private final AuthenticationErrorWriter errorWriter;
    private final RequestMatcher publicEndpoints;
    private final ConcurrentHashMap<PolicyEnforcerConfig, PolicyEnforcer> policyEnforcers = new ConcurrentHashMap<>();

    public PolicyEnforcerFilter(
            PathBasedConfigResolver configResolver,
            AuthenticationErrorWriter errorWriter,
            RequestMatcher publicEndpoints) {
        this.configResolver = configResolver;
        this.errorWriter = errorWriter;
        this.publicEndpoints = publicEndpoints;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equals(request.getMethod())
                || publicEndpoints.matches(request)
                || !(SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String rawToken = ((JwtAuthenticationToken) authentication).getToken().getTokenValue();
        PolicyEnforcer policyEnforcer = policyEnforcers.computeIfAbsent(
                configResolver.resolve(request), PolicyEnforcerFilter::createPolicyEnforcer);

        ErrorCapturingResponse capturing = new ErrorCapturingResponse(response);
        AuthorizationContext authzContext = policyEnforcer.enforce(
                new ServletHttpRequest(request, (TokenPrincipal) () -> rawToken),
                new ServletHttpResponse(capturing));
        request.setAttribute(AuthorizationContext.class.getName(), authzContext);

        if (authzContext.isGranted()) {
            chain.doFilter(request, response);
            return;
        }
        Integer status = capturing.errorStatus;
        log.warn("Keycloak policy enforcer denied {} {} with status {}", request.getMethod(), request.getRequestURI(), status);
        ErrorCode errorCode = status != null && status == HttpStatus.UNAUTHORIZED.value()
                ? ErrorCode.UNAUTHENTICATED
                : ErrorCode.ACCESS_DENIED;
        errorWriter.write(request, response, errorCode);
    }

    /** Spring Security already validated the JWT, so the enforcer must never redirect to a login page. */
    private static PolicyEnforcer createPolicyEnforcer(PolicyEnforcerConfig config) {
        log.info("Create Keycloak policy enforcer for realm {}, resource {}", config.getRealm(), config.getResource());
        return PolicyEnforcer.builder()
                .authServerUrl(config.getAuthServerUrl())
                .realm(config.getRealm())
                .clientId(config.getResource())
                .credentials(config.getCredentials())
                .bearerOnly(true)
                .enforcerConfig(config)
                .build();
    }

    /** Records the enforcer's sendError instead of committing the container's default error page. */
    private static final class ErrorCapturingResponse extends HttpServletResponseWrapper {

        private Integer errorStatus;

        ErrorCapturingResponse(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void sendError(int sc) {
            errorStatus = sc;
        }

        @Override
        public void sendError(int sc, String msg) {
            errorStatus = sc;
        }
    }
}
