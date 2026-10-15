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

/** Bảng form: biểu mẫu nhập liệu; các trường nằm ở form_field. */
@Getter
@Setter
@Entity
@Table(name = "form")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FormEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "title", nullable = false, length = 500)
    String title;

    @Column(name = "description", length = 1000)
    String description;

    /** Realm Keycloak của người tạo. */
    @Column(name = "realm", length = 100, updatable = false)
    String realm;

    @Column(name = "deleted", nullable = false)
    boolean deleted;
}
