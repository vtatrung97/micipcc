package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Thông tin user tài khoản (Keycloak) dùng để đồng bộ sang bảng user_account.. */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUserDto {
    @JsonProperty("id")
    String id;

    @JsonProperty("username")
    String username;

    @JsonProperty("realm")
    String realm;

    @JsonProperty("realm_id")
    String realmId;

    @JsonProperty("email")
    String email;

    @JsonProperty("phone_number")
    String phoneNumber;

    @JsonProperty("first_name")
    String firstName;

    @JsonProperty("last_name")
    String lastName;

    @JsonProperty("enabled")
    boolean enabled;

    @JsonProperty("kz_account_id")
    String kzAccountId;

    @JsonProperty("kz_user_id")
    String kzUserId;

    @JsonProperty("group_id")
    String groupId;
}
