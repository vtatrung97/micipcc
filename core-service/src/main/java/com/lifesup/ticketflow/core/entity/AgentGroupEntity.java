package com.lifesup.ticketflow.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Bảng agent_group: nhóm agent, cấu trúc giữ nguyên như bảng agent_group của IPCC
 * để import dữ liệu export từ IPCC.
 */
@Getter
@Setter
@Entity
@Table(name = "agent_group")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentGroupEntity {

    @Id
    @Column(name = "agent_group_id", length = 36)
    String agentGroupId;

    @Column(name = "agent_group_code", nullable = false)
    String agentGroupCode;

    @Column(name = "agent_group_name", nullable = false)
    String agentGroupName;

    @Column(name = "description", length = 500)
    String description;

    /** Tenant. */
    @Column(name = "realm_name", nullable = false, length = 36)
    String realmName;

    /** Id tài khoản trên Kazoo. */
    @Column(name = "kz_account_id", nullable = false)
    String kzAccountId;

    /** Id chủ dịch vụ. */
    @Column(name = "group_id", nullable = false, length = 36)
    String groupId;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(name = "status", nullable = false)
    Integer status;

    /** Epoch millis. */
    @Column(name = "create_time", nullable = false)
    Long createTime;

    @Column(name = "create_by", nullable = false)
    String createBy;

    /** Epoch millis. */
    @Column(name = "update_time")
    Long updateTime;

    @Column(name = "update_by")
    String updateBy;

    @Column(name = "AGENT_LEADER_ID", length = 36)
    String agentLeaderId;

    @Column(name = "ipcc_src", length = 10)
    String ipccSrc;

    @Column(name = "ipcc_ver")
    Integer ipccVer;
}
