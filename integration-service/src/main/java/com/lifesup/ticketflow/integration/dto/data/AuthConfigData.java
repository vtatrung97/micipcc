package com.lifesup.ticketflow.integration.dto.data;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Cấu hình xác thực KHÔNG bí mật của connection (lưu dạng rõ ở cột auth_config). Field nào cần tuỳ authType:
 * API_KEY {headerName}, BASIC {username}, BEARER {}, OAUTH2_CLIENT_CREDENTIALS {tokenUrl, clientId, scope?}.
 * Phần bí mật nằm ở {@link SecretData}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthConfigData {

    @Schema(description = "API_KEY: tên header chứa key", example = "X-API-Key")
    @Size(max = 255, message = "{validation.authConfig.field.size}")
    String headerName;

    @Schema(description = "BASIC: tên đăng nhập")
    @Size(max = 255, message = "{validation.authConfig.field.size}")
    String username;

    @Schema(description = "OAUTH2_CLIENT_CREDENTIALS: URL lấy token (http/https)", example = "https://sso.example.com/token")
    @Size(max = 1000, message = "{validation.authConfig.field.size}")
    String tokenUrl;

    @Schema(description = "OAUTH2_CLIENT_CREDENTIALS: client id")
    @Size(max = 255, message = "{validation.authConfig.field.size}")
    String clientId;

    @Schema(description = "OAUTH2_CLIENT_CREDENTIALS: scope, không bắt buộc")
    @Size(max = 1000, message = "{validation.authConfig.field.size}")
    String scope;
}
