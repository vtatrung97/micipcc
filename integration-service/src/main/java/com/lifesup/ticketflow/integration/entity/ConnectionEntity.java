package com.lifesup.ticketflow.integration.entity;

import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
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

/** Bảng connection: endpoint gốc, xác thực và cấu hình chịu lỗi tới một hệ thống thứ 3 (BR-INT-01, BR-INT-02). */
@Getter
@Setter
@Entity
@Table(name = "connection")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    /** external_system.id */
    @Column(name = "system_id", nullable = false)
    Long systemId;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "protocol", nullable = false, length = 20)
    Protocol protocol;

    @Column(name = "base_url", nullable = false, length = 1000)
    String baseUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_type", nullable = false, length = 30)
    AuthType authType;

    /** Cấu hình xác thực không bí mật (JSON). */
    @Column(name = "auth_config", columnDefinition = "longtext")
    String authConfig;

    /** Tham chiếu secret trong Vault, không chứa giá trị secret. */
    @Column(name = "secret_ref", length = 500)
    String secretRef;

    @Column(name = "timeout_ms", nullable = false)
    Integer timeoutMs;

    @Column(name = "rate_limit_per_second")
    Integer rateLimitPerSecond;

    /** Cấu hình circuit breaker (JSON). */
    @Column(name = "circuit_breaker_config", columnDefinition = "longtext")
    String circuitBreakerConfig;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    Status status;

    @Column(name = "deleted", nullable = false)
    boolean deleted;

    @Column(name = "tenant_id", length = 100, updatable = false)
    String tenantId;

    /** Realm Keycloak của người tạo, gán khi tạo mới từ SecurityContextUtils.getRealm(). */
    @Column(name = "realm", length = 100, updatable = false)
    String realm;

    /** Id group Keycloak của người tạo. */
    @Column(name = "group_id", length = 36, updatable = false)
    String groupId;
}
