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

import java.time.Instant;

/**
 * Bảng user_account: bản sao đọc người dùng từ Keycloak (Architecture Design mục 2.5),
 * dùng để phân việc và tra quản lý trực tiếp mà không gọi Keycloak mỗi lần.
 */
@Getter
@Setter
@Entity
@Table(name = "user_account")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    /** Id user Keycloak. */
    @Column(name = "keycloak_id", nullable = false, length = 36, updatable = false)
    String keycloakId;

    @Column(name = "username", length = 100)
    String username;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "email")
    String email;

    /** Đơn vị (org_unit.id). */
    @Column(name = "org_unit_id")
    Long orgUnitId;

    /** Keycloak id của quản lý trực tiếp. */
    @Column(name = "manager_user", length = 36)
    String managerUser;

    /** Giá trị của {@link Status}: 0 = INACTIVE, 1 = ACTIVE. */
    @Column(name = "status", nullable = false)
    short status;

    /** Lần đồng bộ gần nhất từ Keycloak. */
    @Column(name = "synced_at")
    Instant syncedAt;

    @Column(name = "kz_user_id", length = 100)
    String kzUserId;

    @Column(name = "kz_account_id", length = 100)
    String kzAccountId;

    @Column(name = "vsa_user_login", length = 100)
    String vsaUserLogin;

    @Column(name = "description", length = 1000)
    String description;

    /** Realm Keycloak của user. */
    @Column(name = "realm", length = 100)
    String realm;

    /** Id group Keycloak của user. */
    @Column(name = "group_id", length = 36)
    String groupId;

    public enum Status {
        INACTIVE((short) 0),
        ACTIVE((short) 1);

        public final short value;

        Status(short value) {
            this.value = value;
        }
    }
}
