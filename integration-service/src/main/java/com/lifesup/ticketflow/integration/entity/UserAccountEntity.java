package com.lifesup.ticketflow.integration.entity;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;



@Getter
@Setter
@Entity
@Table(name = "user_account")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    @Column(name = "keycloak_id", nullable = false, length = 36, updatable = false)
    String keycloakId;

    @Column(name = "username", length = 100)
    String username;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "email")
    String email;

    @Column(name = "org_unit_id")
    Long orgUnitId;

    @Column(name = "manager_user", length = 36)
    String managerUser;

    @Column(name = "status", nullable = false)
    short status;

    @Column(name = "synced_at")
    Long syncedAt;

    @Column(name = "kz_user_id", length = 100)
    String kzUserId;

    @Column(name = "kz_account_id", length = 100)
    String kzAccountId;

    @Column(name = "vsa_user_login", length = 100)
    String vsaUserLogin;

    @Column(name = "description", length = 1000)
    String description;

    @Column(name = "realm", length = 100)
    String realm;

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
