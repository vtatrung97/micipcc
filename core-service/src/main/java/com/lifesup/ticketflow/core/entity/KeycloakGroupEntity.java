package com.lifesup.ticketflow.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * Bảng keycloak_group: group Keycloak (đơn vị / phòng ban / nhóm), cấu trúc giữ nguyên như KeycloakGroupEntity của IPCC
 * để import dữ liệu export từ IPCC. ProcessX chỉ đọc.
 */
@Getter
@Setter
@Entity
@Table(name = "keycloak_group")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KeycloakGroupEntity {

    /** Id group Keycloak. */
    @Id
    @Column(name = "id", length = 36)
    String id;

    @Column(name = "name")
    String name;

    /** Id group cha, trống = group cấp cao nhất. */
    @Column(name = "parent_group", length = 36)
    String parentGroup;

    @Column(name = "type")
    Short type;

    @Column(name = "code")
    String code;

    /** Theo IPCC: group cấp cao nhất thì = id. */
    @Column(name = "group_source_id", length = 36)
    String groupSourceId;

    @Column(name = "status")
    Short status;

    @Column(name = "is_deleting")
    Short isDeleting;

    @Column(name = "realm_name")
    String realmName;

    /** Epoch millis. */
    @Column(name = "create_time")
    Long createTime;

    @Column(name = "create_by")
    String createBy;

    /** Epoch millis. */
    @Column(name = "update_time")
    Long updateTime;

    @Column(name = "update_by")
    String updateBy;
}
