-- -----------------------------------------------------------------------------------------------------
-- 1. Database (trong MariaDB, database = schema)
-- -----------------------------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS flow_core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------------------------------
-- 2. User của service
--    Mật khẩu theo quy tắc <tênDB>#123 cho dev/local; staging/production DevOps đổi mật khẩu riêng.
--    App chỉ đọc/ghi dữ liệu, không có quyền DDL.
-- -----------------------------------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'flow_core'@'%' IDENTIFIED BY 'flow_core#123';
GRANT SELECT, INSERT, UPDATE, DELETE ON flow_core.* TO 'flow_core'@'%';
FLUSH PRIVILEGES;


-- -----------------------------------------------------------------------------------------------------
-- 3. Bảng
-- -----------------------------------------------------------------------------------------------------
USE flow_core;

-- 3.1 ticket_call_flow: quy trình thiết kế trên Canvas (kéo thả).
--     FE gửi JSON canvas (nodes, edges...), BE lưu nguyên văn và trả lại để FE vẽ lại.
CREATE TABLE IF NOT EXISTS ticket_call_flow (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    code         VARCHAR(100)  NOT NULL COMMENT 'Mã quy trình, duy nhất trong các bản ghi chưa xoá, không đổi sau khi tạo',
    name         VARCHAR(255)  NOT NULL COMMENT 'Tên quy trình',
    description  VARCHAR(1000) NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT | ACTIVE | INACTIVE',
    flow_json    LONGTEXT      NOT NULL COMMENT 'JSON canvas do FE gửi lên',
    deleted      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    created_at   BIGINT        NOT NULL COMMENT 'Thời điểm tạo, timestamp mili giây (epoch millis)',
    created_by   VARCHAR(100)  NULL,
    updated_at   BIGINT        NULL COMMENT 'Thời điểm cập nhật, timestamp mili giây (epoch millis)',
    updated_by   VARCHAR(100)  NULL,
    row_version  BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock: chống 2 người lưu đè lên nhau',
    -- Cột ảo = code khi chưa xoá, NULL khi đã xoá: cho phép tạo lại mã đã bị xoá mềm
    active_code  VARCHAR(100)  AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT ck_ticket_call_flow_json CHECK (JSON_VALID(flow_json)),
    CONSTRAINT ck_ticket_call_flow_status CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
    UNIQUE KEY uk_ticket_call_flow_active_code (active_code),
    KEY idx_ticket_call_flow_status_updated (deleted, status, updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Quy trình ticket/call thiết kế bằng Canvas';
