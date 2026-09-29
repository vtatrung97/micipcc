package com.lifesup.processx.core.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.keycloak.representations.AccessToken;

/**
 * Kết quả introspection của Keycloak (RFC 7662): các claim của access token kèm cờ active.
 * active=false khi token hết hạn, sai chữ ký, session đã logout hoặc user bị khoá.
 */
@Getter
@Setter
public class KeycloakIntrospectionResponse extends AccessToken {

    @JsonProperty("active")
    boolean active;
}
