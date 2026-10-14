package com.lifesup.ticketflow.core.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một group Keycloak (đơn vị / phòng ban / nhóm).
 * Thứ tự field khớp constructor dùng trong KeycloakGroupRepository.search.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KeycloakGroupResponse {
    /** Id group Keycloak. */
    String id;
    String name;
    /** Id group cha, trống = group cấp cao nhất. */
    String parentGroup;
    Short type;
    String code;
    String groupSourceId;
    Short status;
    Short isDeleting;
    String realmName;
}
