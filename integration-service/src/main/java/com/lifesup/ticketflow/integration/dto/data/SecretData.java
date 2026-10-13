package com.lifesup.ticketflow.integration.dto.data;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

/**
 * Secret của connection theo authType: API_KEY {apiKey}, BASIC {password}, BEARER {token},
 * OAUTH2_CLIENT_CREDENTIALS {clientSecret}. Chỉ ghi: mã hoá lưu ở connection_credential, không bao giờ trả ra API / log.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString(onlyExplicitlyIncluded = true)
@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
public class SecretData {

    @Size(max = 4000, message = "{validation.secret.field.size}")
    String apiKey;

    @Size(max = 4000, message = "{validation.secret.field.size}")
    String password;

    @Size(max = 4000, message = "{validation.secret.field.size}")
    String token;

    @Size(max = 4000, message = "{validation.secret.field.size}")
    String clientSecret;
}
