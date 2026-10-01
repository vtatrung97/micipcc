-- -----------------------------------------------------------------------------------------------------
-- 1. Database (trong MariaDB, database = schema)
-- -----------------------------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS flow_core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'flow_core'@'%' IDENTIFIED BY 'flow_core#123';
GRANT SELECT, INSERT, UPDATE, DELETE ON flow_core.* TO 'flow_core'@'%';
FLUSH PRIVILEGES;


-- -----------------------------------------------------------------------------------------------------
-- 3. Bảng
-- -----------------------------------------------------------------------------------------------------
USE flow_core;
DROP TABLE IF EXISTS ticket_call_flow;
CREATE TABLE ticket_call_flow (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    code              VARCHAR(100)  NOT NULL COMMENT 'Mã quy trình, duy nhất trong các bản ghi chưa xoá, không đổi sau khi tạo',
    name              VARCHAR(255)  NOT NULL COMMENT 'Tên quy trình',
    case_code_prefix  VARCHAR(20)   NOT NULL COMMENT 'Tiền tố mã hồ sơ (VD PAKN → PAKN-2026-00001), duy nhất trong các bản ghi chưa xoá, không đổi sau khi tạo',
    description       VARCHAR(1000) NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT | ACTIVE | INACTIVE',
    deleted           TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    realm             VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id          VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at        BIGINT        NOT NULL COMMENT 'Thời điểm tạo, timestamp mili giây (epoch millis)',
    created_by        VARCHAR(100)  NULL,
    updated_at        BIGINT        NULL COMMENT 'Thời điểm cập nhật, timestamp mili giây (epoch millis)',
    updated_by        VARCHAR(100)  NULL,
    row_version       BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock: chống 2 người lưu đè lên nhau',
    -- Cột ảo = giá trị gốc khi chưa xoá, NULL khi đã xoá: cho phép tạo lại mã / tiền tố của bản ghi đã xoá mềm
    active_code             VARCHAR(100) AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    active_case_code_prefix VARCHAR(20)  AS (IF(deleted = 0, case_code_prefix, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT ck_ticket_call_flow_status CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
    UNIQUE KEY uk_ticket_call_flow_active_code (active_code),
    UNIQUE KEY uk_ticket_call_flow_active_case_prefix (active_case_code_prefix),
    KEY idx_ticket_call_flow_status_updated (deleted, status, updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Quy trình ticket/call thiết kế bằng Canvas';

DROP TABLE IF EXISTS ticket_call_flow_version;
CREATE TABLE ticket_call_flow_version (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    flow_id             BIGINT        NOT NULL COMMENT 'ticket_call_flow.id',
    version_no          INT           NOT NULL COMMENT 'Số phiên bản, tăng dần từ 1 trong từng quy trình',
    status              VARCHAR(20)   NOT NULL COMMENT 'DRAFT | PUBLISHED | ARCHIVED',
    version_name        VARCHAR(255)  NULL COMMENT 'Tên phiên bản, trống thì FE hiển thị "Phiên bản <version_no>"',
    version_description VARCHAR(1000) NULL COMMENT 'Mô tả thay đổi của phiên bản',
    flow_json           LONGTEXT      NOT NULL COMMENT 'JSON canvas do FE gửi lên',
    published_at        BIGINT        NULL COMMENT 'Thời điểm publish, timestamp mili giây (epoch millis)',
    published_by        VARCHAR(100)  NULL,
    realm               VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id            VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at          BIGINT        NOT NULL COMMENT 'Thời điểm tạo, timestamp mili giây (epoch millis)',
    created_by          VARCHAR(100)  NULL,
    updated_at          BIGINT        NULL COMMENT 'Thời điểm cập nhật, timestamp mili giây (epoch millis)',
    updated_by          VARCHAR(100)  NULL,
    row_version         BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    draft_flow_id       BIGINT AS (IF(status = 'DRAFT', flow_id, NULL)) PERSISTENT,
    published_flow_id   BIGINT AS (IF(status = 'PUBLISHED', flow_id, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT fk_ticket_call_flow_version_flow FOREIGN KEY (flow_id) REFERENCES ticket_call_flow (id),
    CONSTRAINT ck_ticket_call_flow_version_json CHECK (JSON_VALID(flow_json)),
    CONSTRAINT ck_ticket_call_flow_version_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    UNIQUE KEY uk_ticket_call_flow_version_no (flow_id, version_no),
    UNIQUE KEY uk_ticket_call_flow_version_draft (draft_flow_id),
    UNIQUE KEY uk_ticket_call_flow_version_published (published_flow_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Phiên bản canvas của quy trình ticket/call';
