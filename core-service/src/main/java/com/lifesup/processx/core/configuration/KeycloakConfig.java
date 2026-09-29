package com.lifesup.processx.core.configuration;

import jakarta.ws.rs.client.ClientBuilder;
import org.jboss.resteasy.client.jaxrs.ResteasyClient;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.JacksonProvider;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Configuration
public class KeycloakConfig {

    /**
     * HTTP client dùng chung cho mọi lời gọi sang Keycloak (login, refresh, logout, kiểm tra token, admin API):
     * có connection pool và timeout, cấu hình Jackson giống Keycloak admin client.
     */
    @Bean(destroyMethod = "close")
    public ResteasyClient keycloakResteasyClient(KeycloakProperties properties) {
        ResteasyClientBuilder builder = ((ResteasyClientBuilder) ClientBuilder.newBuilder())
                .connectionPoolSize(properties.getConnectionPoolSize())
                .maxPooledPerRoute(properties.getConnectionPoolSize())
                .connectTimeout(properties.getConnectTimeout().toMillis(), TimeUnit.MILLISECONDS)
                .readTimeout(properties.getReadTimeout().toMillis(), TimeUnit.MILLISECONDS);
        builder.register(JacksonProvider.class, 100);
        return builder.build();
    }

    /**
     * Keycloak Admin Client dùng chung (tự làm mới token), để đọc user/group/role.
     * Bật bằng keycloak-admin-client.enabled=true. Không close ở đây vì HTTP client do bean trên quản lý.
     */
    @Bean(destroyMethod = "")
    @ConditionalOnProperty(prefix = "keycloak-admin-client", name = "enabled", havingValue = "true")
    public Keycloak keycloakAdminClient(KeycloakAdminClientProperties properties, ResteasyClient keycloakResteasyClient) {
        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(properties.getAuthServerUrl())
                .realm(properties.getRealm())
                .clientId(properties.getClientId())
                .resteasyClient(keycloakResteasyClient);

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
