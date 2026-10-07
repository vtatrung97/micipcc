-- -----------------------------------------------------------------------------------------------------
-- Schema integration_service theo Architecture Design v1.1 mục 2.6 và mục 6 (System → Connection → Operation → Action).
-- Quy ước giống core-service:
--   - Tên bảng theo nghiệp vụ, không tiền tố.
--   - Khoá chính BIGINT sinh theo thời gian (TSID) ở phía ứng dụng, không AUTO_INCREMENT.
--   - Thời gian DATETIME(3) lưu theo UTC.
--   - Cột chuẩn: tenant_id, realm, group_id, created_at, created_by, updated_at, updated_by, row_version;
--     bảng cấu hình xoá mềm (deleted), mã duy nhất trong bản ghi chưa xoá dùng cột ảo active_code.
-- File đã chạy lên môi trường nào thì KHÔNG sửa / đổi tên nữa, thay đổi tiếp theo viết file mới.
-- -----------------------------------------------------------------------------------------------------

-- external_system: hệ thống thứ 3 được khai báo (BR-INT-01). Chỉ hệ thống ACTIVE mới được dùng trong Flow.
CREATE TABLE external_system (
    id           BIGINT        NOT NULL COMMENT 'TSID',
    code         VARCHAR(100)  NOT NULL COMMENT 'Mã hệ thống, duy nhất trong các bản ghi chưa xoá',
    name         VARCHAR(255)  NOT NULL COMMENT 'Tên hệ thống',
    environment  VARCHAR(20)   NULL COMMENT 'Môi trường kết nối, VD DEV | UAT | PROD',
    description  VARCHAR(1000) NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | INACTIVE',
    deleted      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    tenant_id    VARCHAR(100)  NULL,
    realm        VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id     VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at   DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by   VARCHAR(100)  NULL,
    updated_at   DATETIME(3)   NULL COMMENT 'UTC',
    updated_by   VARCHAR(100)  NULL,
    row_version  BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    active_code  VARCHAR(100)  AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT ck_external_system_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    UNIQUE KEY uk_external_system_active_code (active_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Hệ thống thứ 3 được khai báo';

-- connection: điểm kết nối tới một hệ thống (endpoint gốc + xác thực + chịu lỗi), BR-INT-01, BR-INT-02.
-- Secret KHÔNG lưu ở đây: secret_ref là đường dẫn trong Vault. auth_config chỉ giữ phần không bí mật
-- (VD tên header API key, token URL, scope của OAuth2).
CREATE TABLE connection (
    id                     BIGINT        NOT NULL COMMENT 'TSID',
    system_id              BIGINT        NOT NULL COMMENT 'external_system.id',
    code                   VARCHAR(100)  NOT NULL COMMENT 'Mã kết nối, duy nhất trong hệ thống (bản ghi chưa xoá)',
    name                   VARCHAR(255)  NOT NULL,
    protocol               VARCHAR(20)   NOT NULL DEFAULT 'REST' COMMENT 'REST | SOAP',
    base_url               VARCHAR(1000) NOT NULL COMMENT 'Endpoint gốc, egress chỉ cho phép tới endpoint đã khai báo (chống SSRF)',
    auth_type              VARCHAR(30)   NOT NULL DEFAULT 'NONE' COMMENT 'NONE | API_KEY | BASIC | BEARER | OAUTH2_CLIENT_CREDENTIALS',
    auth_config            LONGTEXT      NULL COMMENT 'Cấu hình xác thực không bí mật (JSON)',
    secret_ref             VARCHAR(500)  NULL COMMENT 'Tham chiếu secret trong Vault, không lưu giá trị secret',
    timeout_ms             INT           NOT NULL DEFAULT 5000 COMMENT 'Timeout mặc định của mọi operation thuộc kết nối',
    rate_limit_per_second  INT           NULL COMMENT 'Giới hạn số lần gọi mỗi giây, NULL = không giới hạn',
    circuit_breaker_config LONGTEXT      NULL COMMENT 'Cấu hình circuit breaker Resilience4j (JSON)',
    status                 VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE | INACTIVE',
    deleted                TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    tenant_id              VARCHAR(100)  NULL,
    realm                  VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id               VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at             DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by             VARCHAR(100)  NULL,
    updated_at             DATETIME(3)   NULL COMMENT 'UTC',
    updated_by             VARCHAR(100)  NULL,
    row_version            BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    active_code            VARCHAR(100)  AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT fk_connection_system FOREIGN KEY (system_id) REFERENCES external_system (id),
    CONSTRAINT ck_connection_protocol CHECK (protocol IN ('REST', 'SOAP')),
    CONSTRAINT ck_connection_auth_type CHECK (auth_type IN ('NONE', 'API_KEY', 'BASIC', 'BEARER', 'OAUTH2_CLIENT_CREDENTIALS')),
    CONSTRAINT ck_connection_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_connection_auth_config CHECK (auth_config IS NULL OR JSON_VALID(auth_config)),
    CONSTRAINT ck_connection_cb_config CHECK (circuit_breaker_config IS NULL OR JSON_VALID(circuit_breaker_config)),
    UNIQUE KEY uk_connection_active_code (system_id, active_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Kết nối tới hệ thống thứ 3';

-- operation: API được phép gọi qua một kết nối (BR-INT-03, BR-INT-04, BR-INT-05). Có version: sửa API đang dùng
-- thì tạo version mới, Action bên core-service trỏ tới operation.id cụ thể. Chỉ ACTIVE mới được chọn trong Flow.
CREATE TABLE operation (
    id                BIGINT        NOT NULL COMMENT 'TSID',
    connection_id     BIGINT        NOT NULL COMMENT 'connection.id',
    code              VARCHAR(100)  NOT NULL COMMENT 'Mã API, duy nhất theo kết nối + version (bản ghi chưa xoá)',
    version_no        INT           NOT NULL DEFAULT 1 COMMENT 'Số phiên bản, tăng dần từ 1 trong cùng mã',
    name              VARCHAR(255)  NOT NULL,
    description       VARCHAR(1000) NULL,
    http_method       VARCHAR(10)   NOT NULL COMMENT 'GET | POST | PUT | PATCH | DELETE',
    path              VARCHAR(1000) NOT NULL COMMENT 'Path nối sau base_url của kết nối, cho phép biến dạng {var}',
    headers           LONGTEXT      NULL COMMENT 'Header cố định (JSON), không chứa secret',
    query_params      LONGTEXT      NULL COMMENT 'Tham số query (JSON)',
    request_schema    LONGTEXT      NULL COMMENT 'JSON Schema kiểm dữ liệu gửi đi',
    response_schema   LONGTEXT      NULL COMMENT 'JSON Schema kiểm dữ liệu nhận về',
    request_mapping   LONGTEXT      NULL COMMENT 'Biểu thức JSONata dựng request từ dữ liệu Flow',
    response_mapping  LONGTEXT      NULL COMMENT 'Biểu thức JSONata đưa response vào Output/Variable của Flow',
    timeout_ms        INT           NULL COMMENT 'Ghi đè timeout của kết nối, NULL = dùng của kết nối',
    retry_policy      LONGTEXT      NULL COMMENT 'Chính sách retry (JSON): số lần, backoff, điều kiện',
    status            VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT | ACTIVE | INACTIVE',
    deleted           TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    tenant_id         VARCHAR(100)  NULL,
    realm             VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id          VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at        DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by        VARCHAR(100)  NULL,
    updated_at        DATETIME(3)   NULL COMMENT 'UTC',
    updated_by        VARCHAR(100)  NULL,
    row_version       BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    active_code       VARCHAR(100)  AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT fk_operation_connection FOREIGN KEY (connection_id) REFERENCES connection (id),
    CONSTRAINT ck_operation_http_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
    CONSTRAINT ck_operation_status CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
    CONSTRAINT ck_operation_headers CHECK (headers IS NULL OR JSON_VALID(headers)),
    CONSTRAINT ck_operation_query_params CHECK (query_params IS NULL OR JSON_VALID(query_params)),
    CONSTRAINT ck_operation_request_schema CHECK (request_schema IS NULL OR JSON_VALID(request_schema)),
    CONSTRAINT ck_operation_response_schema CHECK (response_schema IS NULL OR JSON_VALID(response_schema)),
    CONSTRAINT ck_operation_retry_policy CHECK (retry_policy IS NULL OR JSON_VALID(retry_policy)),
    UNIQUE KEY uk_operation_active_code_version (connection_id, active_code, version_no),
    KEY idx_operation_status_updated (deleted, status, updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'API được phép gọi tới hệ thống thứ 3';

-- execution_log: lịch sử mọi lần gọi hệ thống ngoài (BR-INT-05, BR-INT-06). Chỉ ghi thêm, không sửa.
-- Body/header đã che dữ liệu nhạy cảm, không ghi token. Không đặt FK để ghi nhanh và để phân mảnh được:
-- PK gồm created_at để sau này chỉ cần ALTER TABLE ... PARTITION BY RANGE COLUMNS (created_at) theo tháng.
CREATE TABLE execution_log (
    id                 BIGINT        NOT NULL COMMENT 'TSID',
    system_id          BIGINT        NULL COMMENT 'external_system.id',
    connection_id      BIGINT        NULL COMMENT 'connection.id',
    operation_id       BIGINT        NULL COMMENT 'operation.id',
    flow_instance_id   VARCHAR(64)   NULL COMMENT 'Process instance id bên Flowable',
    activity_id        VARCHAR(255)  NULL COMMENT 'Node trên BPMN gọi tích hợp',
    correlation_id     VARCHAR(64)   NULL COMMENT 'Dùng khớp callback bất đồng bộ',
    request_id         VARCHAR(64)   NULL COMMENT 'X-Request-Id',
    attempt_no         INT           NOT NULL DEFAULT 1 COMMENT 'Lần thử thứ mấy (retry)',
    status             VARCHAR(20)   NOT NULL COMMENT 'SUCCESS | FAILURE | TIMEOUT',
    http_method        VARCHAR(10)   NULL,
    request_url        VARCHAR(2000) NULL,
    http_status        INT           NULL,
    duration_ms        INT           NULL,
    request_headers    LONGTEXT      NULL COMMENT 'Đã che dữ liệu nhạy cảm',
    request_body       LONGTEXT      NULL COMMENT 'Đã che dữ liệu nhạy cảm',
    response_body      LONGTEXT      NULL COMMENT 'Đã che dữ liệu nhạy cảm',
    error_code         VARCHAR(50)   NULL,
    error_message      VARCHAR(2000) NULL,
    started_at         DATETIME(3)   NULL COMMENT 'UTC',
    finished_at        DATETIME(3)   NULL COMMENT 'UTC',
    tenant_id          VARCHAR(100)  NULL,
    realm              VARCHAR(100)  NULL,
    group_id           VARCHAR(36)   NULL,
    created_at         DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by         VARCHAR(100)  NULL,
    PRIMARY KEY (id, created_at),
    CONSTRAINT ck_execution_log_status CHECK (status IN ('SUCCESS', 'FAILURE', 'TIMEOUT')),
    KEY idx_execution_log_operation (operation_id, created_at),
    KEY idx_execution_log_system (system_id, created_at),
    KEY idx_execution_log_flow_instance (flow_instance_id),
    KEY idx_execution_log_correlation (correlation_id),
    KEY idx_execution_log_created (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Lịch sử gọi hệ thống thứ 3';

-- inbound_request: trigger nhận từ hệ thống ngoài (/ext/v1/triggers). UNIQUE client_id + idempotency_key để chống
-- gọi trùng: gọi lại cùng key thì trả kết quả của lần đầu (giữ 24 giờ theo quy ước API).
CREATE TABLE inbound_request (
    id                BIGINT        NOT NULL COMMENT 'TSID',
    client_id         VARCHAR(100)  NOT NULL COMMENT 'Client Keycloak của đối tác gọi vào',
    idempotency_key   VARCHAR(255)  NOT NULL COMMENT 'Header Idempotency-Key',
    template_code     VARCHAR(100)  NULL COMMENT 'Mã quy trình được yêu cầu khởi tạo',
    payload           LONGTEXT      NULL COMMENT 'Nội dung yêu cầu (JSON), đã che dữ liệu nhạy cảm',
    status            VARCHAR(20)   NOT NULL DEFAULT 'RECEIVED' COMMENT 'RECEIVED | PROCESSING | COMPLETED | FAILED',
    flow_instance_id  VARCHAR(64)   NULL COMMENT 'Flow Instance được tạo',
    response_body     LONGTEXT      NULL COMMENT 'Kết quả trả lại cho đối tác (JSON)',
    error_code        VARCHAR(50)   NULL,
    error_message     VARCHAR(2000) NULL,
    processed_at      DATETIME(3)   NULL COMMENT 'UTC',
    expires_at        DATETIME(3)   NOT NULL COMMENT 'Hết hạn giữ idempotency, UTC',
    tenant_id         VARCHAR(100)  NULL,
    realm             VARCHAR(100)  NULL,
    group_id          VARCHAR(36)   NULL,
    created_at        DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by        VARCHAR(100)  NULL,
    updated_at        DATETIME(3)   NULL COMMENT 'UTC',
    updated_by        VARCHAR(100)  NULL,
    row_version       BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    PRIMARY KEY (id),
    CONSTRAINT ck_inbound_request_status CHECK (status IN ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    CONSTRAINT ck_inbound_request_payload CHECK (payload IS NULL OR JSON_VALID(payload)),
    UNIQUE KEY uk_inbound_request_idempotency (client_id, idempotency_key),
    KEY idx_inbound_request_expires (expires_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Yêu cầu nhận từ hệ thống ngoài';
