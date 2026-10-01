package com.lifesup.ticketflow.core.entity;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
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

/** Bảng ticket_call_flow_version: một phiên bản canvas của quy trình, lưu JSON nguyên văn. */
@Getter
@Setter
@Entity
@Table(name = "ticket_call_flow_version")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowVersionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "flow_id", nullable = false, updatable = false)
    Long flowId;

    @Column(name = "version_no", nullable = false, updatable = false)
    Integer versionNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    TicketCallFlowVersionStatus status;

    /** Tên phiên bản, null thì FE hiển thị "Phiên bản {versionNo}". */
    @Column(name = "version_name")
    String versionName;

    /** Mô tả thay đổi của phiên bản. */
    @Column(name = "version_description", length = 1000)
    String versionDescription;

    /** JSON canvas (nodes, edges...) FE gửi lên, lưu nguyên văn. */
    @Column(name = "flow_json", nullable = false, columnDefinition = "longtext")
    String flowJson;

    /** Timestamp mili giây (epoch millis). */
    @Column(name = "published_at")
    Long publishedAt;

    @Column(name = "published_by", length = 100)
    String publishedBy;
}
