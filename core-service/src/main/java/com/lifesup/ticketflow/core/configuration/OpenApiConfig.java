package com.lifesup.ticketflow.core.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.Locale;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";
    private static final String API_KEY = "apiKey";

    @Bean
    public OpenAPI openAPI(AppProperties appProperties) {
        return new OpenAPI()
                .info(new Info().title("Ticket Flow core-service API").version("v1"))
                .components(new Components()
                        .addSecuritySchemes(BEARER, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Access token Keycloak (lấy qua POST /api/v1/auth/login)"))
                        .addSecuritySchemes(API_KEY, new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name(appProperties.apiKey().headerName())
                                .description("API key cho service nội bộ gọi nhau")))
                // Chọn một trong hai cách xác thực
                .addSecurityItem(new SecurityRequirement().addList(BEARER))
                .addSecurityItem(new SecurityRequirement().addList(API_KEY));
    }

    /** Thêm header Accept-Language cho mọi API để thử đa ngôn ngữ trên Swagger UI. */
    @Bean
    public OperationCustomizer acceptLanguageHeader(AppProperties appProperties) {
        List<String> languages = appProperties.i18n().supportedLocales().stream()
                .map(Locale::toLanguageTag)
                .toList();
        return (operation, handlerMethod) -> operation.addParametersItem(new HeaderParameter()
                .name(HttpHeaders.ACCEPT_LANGUAGE)
                .required(false)
                .description("Ngôn ngữ phản hồi; bỏ trống hoặc giá trị không hỗ trợ sẽ dùng "
                        + appProperties.i18n().defaultLocale().toLanguageTag())
                .schema(new StringSchema()._enum(languages)));
    }
}
