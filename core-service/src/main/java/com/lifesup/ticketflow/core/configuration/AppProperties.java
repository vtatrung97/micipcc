package com.lifesup.ticketflow.core.configuration;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Locale;

/**
 * Cấu hình riêng của core-service (prefix {@code app}), giá trị lấy từ biến môi trường trong application.yaml.
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @Valid @NotNull ApiKey apiKey,
        @Valid @NotNull I18n i18n,
        @NotNull Cors cors) {

    /**
     * @param headerName tên header chứa API key
     * @param keys       danh sách {@code clientId:key} cách nhau bởi dấu phẩy, VD: {@code integration-service:xxx,report-service:yyy}
     */
    public record ApiKey(@NotBlank String headerName, String keys) {}

    public record I18n(@NotNull Locale defaultLocale, @NotEmpty List<Locale> supportedLocales) {}

    public record Cors(List<String> allowedOrigins) {}
}
