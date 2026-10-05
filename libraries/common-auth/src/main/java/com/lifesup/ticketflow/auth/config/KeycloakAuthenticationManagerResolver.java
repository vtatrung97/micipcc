package com.lifesup.ticketflow.auth.config;

import com.lifesup.ticketflow.auth.converter.KeycloakJwtAuthenticationConverter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.adapters.config.PolicyEnforcerConfig;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Validates the bearer token against the Keycloak realm of the request, using the config from
 * {@link PathBasedConfigResolver}: signature via the realm JWKS, issuer = {@code <auth-server-url>/realms/<realm>}.
 * Client roles are read from {@code resource_access.<resource>}.
 */
@Slf4j
public class KeycloakAuthenticationManagerResolver implements AuthenticationManagerResolver<HttpServletRequest> {

    private final PathBasedConfigResolver configResolver;
    private final ConcurrentHashMap<PolicyEnforcerConfig, AuthenticationManager> cache = new ConcurrentHashMap<>();

    public KeycloakAuthenticationManagerResolver(PathBasedConfigResolver configResolver) {
        this.configResolver = configResolver;
    }

    @Override
    public AuthenticationManager resolve(HttpServletRequest request) {
        PolicyEnforcerConfig config;
        try {
            config = configResolver.resolve(request);
        } catch (IllegalStateException e) {
            // Unknown realm / missing config on MinIO: reject the token instead of failing with 500
            log.warn("Unable to resolve keycloak config: {}", e.getMessage());
            return authentication -> {
                throw new InvalidBearerTokenException("Unable to resolve keycloak config of the token realm");
            };
        }
        return cache.computeIfAbsent(config, KeycloakAuthenticationManagerResolver::create);
    }

    private static AuthenticationManager create(PolicyEnforcerConfig config) {
        String issuer = stripTrailingSlash(config.getAuthServerUrl()) + "/realms/" + config.getRealm();
        log.info("Create JWT authentication for issuer {}", issuer);

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(issuer + "/protocol/openid-connect/certs").build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));

        JwtAuthenticationProvider provider = new JwtAuthenticationProvider(decoder);
        provider.setJwtAuthenticationConverter(new KeycloakJwtAuthenticationConverter(List.of(config.getResource())));
        return new ProviderManager(provider);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
