package com.lifesup.ticketflow.core.configuration;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

/**
 * Cấu hình riêng của core-service (prefix {@code app}), giá trị lấy từ biến môi trường trong application.yaml.
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @NotNull Security security,
        @Valid @NotNull ApiKey apiKey,
        @Valid @NotNull I18n i18n,
        @Valid @NotNull Redis redis,
        @NotNull Cors cors) {

    /**
     * @param enabled false: tắt xác thực, mọi API đều public (dùng tạm khi chưa có Keycloak). Production bắt buộc true.
     */
    public record Security(boolean enabled) {}

    /**
     * @param headerName tên header chứa API key
     * @param keys       danh sách {@code clientId:key} cách nhau bởi dấu phẩy, VD: {@code integration-service:xxx,report-service:yyy}
     */
    public record ApiKey(@NotBlank String headerName, String keys) {}

    public record I18n(@NotNull Locale defaultLocale, @NotEmpty List<Locale> supportedLocales) {}

    /**
     * @param sentinel  true: kết nối qua Redis Sentinel, false: standalone
     * @param nodes     danh sách sentinel {@code host:port}, cách nhau bởi dấu phẩy
     * @param keyPrefix tiền tố key, tránh trùng khi dùng chung cụm Redis với Ticket Flow
     */
    public record Redis(
            boolean sentinel,
            String master,
            List<String> nodes,
            String host,
            int port,
            String username,
            String password,
            int database,
            boolean ssl,
            @NotNull Duration timeout,
            @NotBlank String keyPrefix) {}

    public record Cors(List<String> allowedOrigins) {}
}
