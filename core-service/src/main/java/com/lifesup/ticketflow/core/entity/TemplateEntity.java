package com.lifesup.ticketflow.core.entity;

import com.lifesup.ticketflow.core.common.enums.ScheduleRepeat;
import com.lifesup.ticketflow.core.common.enums.ScheduleType;
import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.common.enums.TriggerType;
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

import java.time.LocalDate;
import java.time.LocalTime;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", length = 20)
    TriggerType triggerType;

    /** Biểu mẫu dữ liệu đầu vào (MANUAL). */
    @Column(name = "input_form_id", length = 100)
    String inputFormId;

    /** API kích hoạt (AUTO). */
    @Column(name = "trigger_api_id", length = 100)
    String triggerApiId;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", length = 10)
    ScheduleType scheduleType;

    /** Ngày chạy (ONCE), giờ Việt Nam. */
    @Column(name = "schedule_run_date")
    LocalDate scheduleRunDate;

    /** Giờ chạy, giờ Việt Nam. */
    @Column(name = "schedule_run_time")
    LocalTime scheduleRunTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_repeat", length = 20)
    ScheduleRepeat scheduleRepeat;

    @Column(name = "sla_value")
    Integer slaValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_unit", length = 10)
    SlaUnit slaUnit;

    @Column(name = "deleted", nullable = false)
    boolean deleted;
}
