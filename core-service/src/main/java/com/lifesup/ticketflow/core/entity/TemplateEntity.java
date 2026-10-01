package com.lifesup.ticketflow.core.entity;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
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

/** Bảng template: quy trình nghiệp vụ (Template); nội dung canvas nằm ở template_version. */
@Getter
@Setter
@Entity
@Table(name = "template")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TemplateEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    /** Tiền tố mã hồ sơ, VD "PAKN" → hồ sơ PAKN-2026-00001. Không đổi sau khi tạo. */
    @Column(name = "case_code_prefix", nullable = false, length = 20, updatable = false)
    String caseCodePrefix;

    /** Nhóm nghiệp vụ. */
    @Column(name = "category", length = 100)
    String category;

    @Column(name = "description", length = 1000)
    String description;

    /** Đơn vị sở hữu (org_unit.id). */
    @Column(name = "owner_org_id")
    Long ownerOrgId;

    /** Phiên bản đang hiệu lực (template_version.id), null = chưa publish. */
    @Column(name = "active_version_id")
    Long activeVersionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    TicketCallFlowStatus status;

    @Column(name = "deleted", nullable = false)
    boolean deleted;
}
