package com.lifesup.ticketflow.core.entity;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
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


/**
 * Bảng template_version: một phiên bản của Template — mô hình Canvas (lưu JSON nguyên văn),
 * BPMN sinh ra, Dynamic Input schema và mã deployment bên Flowable.
 */
@Getter
@Setter
@Entity
@Table(name = "template_version")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TemplateVersionEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    @Column(name = "template_id", nullable = false, updatable = false)
    Long templateId;

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

    /** Mô hình Canvas (nodes, edges...) FE gửi lên, lưu nguyên văn. */
    @Column(name = "model_json", nullable = false, columnDefinition = "longtext")
    String modelJson;

    /** BPMN sinh ra từ modelJson khi publish. */
    @Column(name = "bpmn_xml", columnDefinition = "longtext")
    String bpmnXml;

    /** Dynamic Input schema (JSON). */
    @Column(name = "input_schema", columnDefinition = "longtext")
    String inputSchema;

    @Column(name = "process_definition_key")
    String processDefinitionKey;

    /** ACT_RE_DEPLOYMENT.ID_ bên Flowable. */
    @Column(name = "deployment_id", length = 64)
    String deploymentId;

    @Column(name = "published_at")
    Long publishedAt;

    @Column(name = "published_by", length = 100)
    String publishedBy;
}
