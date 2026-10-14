package com.lifesup.ticketflow.core.entity;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Bảng app_param: danh mục tham số dùng chung (VD nhóm quy trình), phân loại theo type. */
@Getter
@Setter
@Entity
@Table(name = "app_param")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppParamEntity extends BaseEntity {

    public static final int STATUS_ACTIVE = 1;

    @Id
    @Tsid
    Long id;

    @Column(name = "type", nullable = false, length = 50, updatable = false)
    String type;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    /** 0 = INACTIVE, 1 = ACTIVE. */
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "status", nullable = false)
    Integer status;

    /** Realm Keycloak của người tạo. */
    @Column(name = "realm", length = 100, updatable = false)
    String realm;
}
