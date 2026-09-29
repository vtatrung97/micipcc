package com.lifesup.processx.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@MappedSuperclass
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Long createdAt;

    @CreatedBy
    @Column(name = "created_by", length = 100, updatable = false)
    String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    Long updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    String updatedBy;

    @Version
    @Column(name = "row_version", nullable = false)
    Long rowVersion;
}
