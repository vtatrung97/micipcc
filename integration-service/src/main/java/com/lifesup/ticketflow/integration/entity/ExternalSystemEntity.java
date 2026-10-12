package com.lifesup.ticketflow.integration.entity;

import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/** Bảng external_system: hệ thống thứ 3 được khai báo (BR-INT-01). */
@Getter
@Setter
@Entity
@Table(name = "external_system")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExternalSystemEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    /** Môi trường kết nối, null = không phân biệt. */
    @Enumerated(EnumType.STRING)
    @Column(name = "environment", length = 20)
    Environment environment;

    @Column(name = "description", length = 1000)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    Status status;

    @Column(name = "deleted", nullable = false)
    boolean deleted;

    @Column(name = "tenant_id", length = 100, updatable = false)
    String tenantId;

    /** Realm Keycloak của người tạo, gán khi tạo mới từ SecurityContextUtils.getRealm(). */
    @Column(name = "realm", length = 100, updatable = false)
    String realm;

    /** Id group Keycloak của người tạo. */
    @Column(name = "group_id", length = 36, updatable = false)
    String groupId;
}
