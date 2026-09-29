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

/** Bảng ticket_call_flow (sql/002_create_ticket_call_flow.sql): quy trình thiết kế trên Canvas, lưu JSON nguyên văn. */
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

    @Column(name = "description", length = 1000)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    TicketCallFlowStatus status;

    /** JSON canvas (nodes, edges...) FE gửi lên, lưu nguyên văn. */
    @Column(name = "flow_json", nullable = false, columnDefinition = "longtext")
    String flowJson;

    @Column(name = "deleted", nullable = false)
    boolean deleted;
}
