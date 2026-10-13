package com.lifesup.ticketflow.integration.entity;

import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
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

/** Bảng operation: API được phép gọi qua một kết nối, có version và trạng thái (BR-INT-03…05). */
@Getter
@Setter
@Entity
@Table(name = "operation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    /** connection.id */
    @Column(name = "connection_id", nullable = false)
    Long connectionId;

    @Column(name = "code", nullable = false, length = 100, updatable = false)
    String code;

    @Column(name = "version_no", nullable = false)
    Integer versionNo;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "description", length = 1000)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "http_method", nullable = false, length = 10)
    HttpMethod httpMethod;

    /** Path nối sau base_url của kết nối. */
    @Column(name = "path", nullable = false, length = 1000)
    String path;

    @Column(name = "headers", columnDefinition = "longtext")
    String headers;

    @Column(name = "query_params", columnDefinition = "longtext")
    String queryParams;

    /** Tham số đầu vào (JSON array của OperationInputParam). */
    @Column(name = "input_params", columnDefinition = "longtext")
    String inputParams;

    /** Giá trị đầu ra cho Flow (JSON array của OperationOutputParam). */
    @Column(name = "output_params", columnDefinition = "longtext")
    String outputParams;

    @Column(name = "request_schema", columnDefinition = "longtext")
    String requestSchema;

    @Column(name = "response_schema", columnDefinition = "longtext")
    String responseSchema;

    /** JSONata dựng request từ dữ liệu Flow. */
    @Column(name = "request_mapping", columnDefinition = "longtext")
    String requestMapping;

    /** JSONata đưa response vào Output/Variable của Flow. */
    @Column(name = "response_mapping", columnDefinition = "longtext")
    String responseMapping;

    /** Ghi đè timeout của kết nối, null = dùng của kết nối. */
    @Column(name = "timeout_ms")
    Integer timeoutMs;

    @Column(name = "retry_policy", columnDefinition = "longtext")
    String retryPolicy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    OperationStatus status;

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
