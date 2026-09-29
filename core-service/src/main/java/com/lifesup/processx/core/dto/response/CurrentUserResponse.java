package com.lifesup.processx.core.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CurrentUserResponse {
    /** JWT hoặc API_KEY. */
    String authType;
    /** Keycloak user id (sub) với JWT, clientId với API key. */
    String subject;
    String username;
    String fullName;
    String email;
    List<String> authorities;
}
