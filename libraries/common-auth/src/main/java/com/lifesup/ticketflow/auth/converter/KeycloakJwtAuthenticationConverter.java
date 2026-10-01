package com.lifesup.ticketflow.auth.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Converts a Keycloak access token or RPT into Spring Security authentication. */
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {

    private final List<String> roleClients;

    public KeycloakJwtAuthenticationConverter(List<String> roleClients) {
        this.roleClients = roleClients == null ? List.of() : List.copyOf(roleClients);
    }

    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        return new JwtAuthenticationToken(jwt, authorities(jwt), principalName(jwt));
    }

    private Collection<GrantedAuthority> authorities(Jwt jwt) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();

        roles(claimMap(jwt, "realm_access")).forEach(
                role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));

        Map<String, Object> resourceAccess = claimMap(jwt, "resource_access");
        for (String clientId : roleClients) {
            Object clientAccess = resourceAccess.get(clientId);
            if (clientAccess instanceof Map<?, ?> clientClaims) {
                roles(clientClaims).forEach(role -> authorities.add(new SimpleGrantedAuthority(role)));
            }
        }
        return authorities;
    }

    private static String principalName(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        return StringUtils.hasText(username) ? username : jwt.getSubject();
    }

    private static Map<String, Object> claimMap(Jwt jwt, String claimName) {
        Object claim = jwt.getClaims().get(claimName);
        if (!(claim instanceof Map<?, ?> map)) {
            return Map.of();
        }
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        map.forEach((key, value) -> {
            if (key instanceof String stringKey) {
                result.put(stringKey, value);
            }
        });
        return result;
    }

    private static List<String> roles(Map<?, ?> claims) {
        Object roles = claims.get("roles");
        if (!(roles instanceof Collection<?> collection)) {
            return List.of();
        }
        return collection.stream().filter(String.class::isInstance).map(String.class::cast).toList();
    }
}
