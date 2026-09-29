package com.lifesup.ticketflow.core.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cấu hình Keycloak Admin Client (prefix {@code keycloak-admin-client}), dùng để đọc user/group/role từ Keycloak.
 * Có master-username thì đăng nhập bằng password grant, để trống thì dùng client_credentials với client-secret
 * (khuyến nghị: service account chỉ có quyền view-users, query-groups theo ARC-Q03 - Ticket Flow chỉ đọc Keycloak).
 */
@Data
@ConfigurationProperties(prefix = "keycloak-admin-client")
public class KeycloakAdminClientProperties {
    boolean enabled;
    String realm;
    String clientId;
    String clientSecret;
    String authServerUrl;
    String masterUsername;
    String masterPassword;
}
