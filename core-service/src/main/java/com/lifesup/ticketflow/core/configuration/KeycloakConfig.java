package com.lifesup.ticketflow.core.configuration;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class KeycloakConfig {

    /**
     * Keycloak Admin Client dùng chung (tự làm mới token), để đọc user/group/role.
     * Bật bằng keycloak-admin-client.enabled=true. Token/RPT operations belong to common-auth.
     */
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "keycloak-admin-client", name = "enabled", havingValue = "true")
    public Keycloak keycloakAdminClient(KeycloakAdminClientProperties properties) {
        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(properties.getAuthServerUrl())
                .realm(properties.getRealm())
                .clientId(properties.getClientId());

        if (StringUtils.hasText(properties.getMasterUsername())) {
            builder.grantType(OAuth2Constants.PASSWORD)
                    .username(properties.getMasterUsername())
                    .password(properties.getMasterPassword());
            if (StringUtils.hasText(properties.getClientSecret())) {
                builder.clientSecret(properties.getClientSecret());
            }
        } else {
            builder.grantType(OAuth2Constants.CLIENT_CREDENTIALS).clientSecret(properties.getClientSecret());
        }
        return builder.build();
    }
}
