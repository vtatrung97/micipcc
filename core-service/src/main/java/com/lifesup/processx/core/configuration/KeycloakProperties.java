package com.lifesup.processx.core.configuration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình Keycloak cho xác thực người dùng (prefix {@code keycloak}):
 * API login/refresh/logout và kiểm tra token qua Keycloak bằng client confidential.
 */
@Data
@Validated
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {

    /** URL Keycloak service gọi tới (URL nội bộ trong cluster), VD: http://keycloak:8080. */
    @NotBlank
    String authServerUrl;

    @NotBlank
    String realm;

    /** Client confidential dùng cho login (bật Direct Access Grants) và kiểm tra token (introspection). */
    @NotBlank
    String clientId;

    String clientSecret;

    /** Các client lấy client role làm quyền chức năng (VD: processx-web). */
    List<String> roleClients = new ArrayList<>();

    @NotNull
    Duration connectTimeout = Duration.ofSeconds(3);

    @NotNull
    Duration readTimeout = Duration.ofSeconds(5);

    int connectionPoolSize = 50;
}
