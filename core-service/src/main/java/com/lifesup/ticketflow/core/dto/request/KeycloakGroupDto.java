package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một dòng ipcc_account.keycloak_group trong message CDC (giống KeycloakGroupAccountDto của IPCC), đồng bộ sang keycloak_group. */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KeycloakGroupDto {
    @JsonProperty("ID")
    String id;

    @JsonProperty("NAME")
    String name;

    @JsonProperty("PARENT_GROUP")
    String parentGroup;

    @JsonProperty("REALM_NAME")
    String realmName;

    @JsonProperty("REALM_ID")
    String realmId;

    @JsonProperty("CREATE_BY")
    String createBy;

    @JsonProperty("CREATE_TIME")
    Long createTime;

    @JsonProperty("UPDATE_BY")
    String updateBy;

    @JsonProperty("UPDATE_TIME")
    Long updateTime;

    @JsonProperty("TYPE")
    Short type;

    @JsonProperty("STATUS")
    Short status;

    @JsonProperty("CODE")
    String code;

    @JsonProperty("GROUP_SOURCE_ID")
    String groupSourceId;

    @JsonProperty("IS_DELETING")
    Short isDeleting;
}
