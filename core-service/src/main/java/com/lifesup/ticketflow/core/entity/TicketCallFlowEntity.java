package com.lifesup.ticketflow.core.entity;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/** Bảng ticket_call_flow: thông tin chung của quy trình; nội dung canvas nằm ở ticket_call_flow_version. */
@Getter
@Setter
@Entity
@Table(name = "ticket_call_flow")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    /** Tiền tố mã hồ sơ, VD "PAKN" → hồ sơ PAKN-2026-00001. Không đổi sau khi tạo. */
    @Column(name = "case_code_prefix", nullable = false, length = 20, updatable = false)
    String caseCodePrefix;

    @Column(name = "description", length = 1000)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    TicketCallFlowStatus status;

    @Column(name = "deleted", nullable = false)
    boolean deleted;
}
