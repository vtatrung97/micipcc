-- -----------------------------------------------------------------------------------------------------
-- V1: khởi tạo schema flow_core. Quy ước theo Architecture Design v1.1 mục 2.1:
--   - Tên bảng theo nghiệp vụ, không tiền tố.
--   - Khoá chính BIGINT sinh theo thời gian (TSID) ở phía ứng dụng, không AUTO_INCREMENT.
--   - Thời gian DATETIME(3) lưu theo UTC.
--   - Cột chuẩn: tenant_id, created_at, created_by, updated_at, updated_by, row_version; bảng cấu hình xoá mềm (deleted).
--   - Thêm realm, group_id (realm / group Keycloak của người tạo) theo quy ước của project.
-- Flyway quản lý file này: đã chạy lên môi trường nào thì KHÔNG sửa nữa, thay đổi tiếp theo viết V2, V3...
-- -----------------------------------------------------------------------------------------------------

-- template: quy trình nghiệp vụ (Template) thiết kế trên Canvas. Nội dung canvas nằm ở template_version.
-- status: DRAFT = chưa publish lần nào; publish lần đầu chuyển ACTIVE, sau đó bật/tắt giữa ACTIVE và INACTIVE.
CREATE TABLE template (
    id                BIGINT        NOT NULL COMMENT 'TSID',
    code              VARCHAR(100)  NOT NULL COMMENT 'Mã quy trình, duy nhất trong các bản ghi chưa xoá, không đổi sau khi tạo',
    name              VARCHAR(255)  NOT NULL COMMENT 'Tên quy trình',
    case_code_prefix  VARCHAR(20)   NOT NULL COMMENT 'Tiền tố mã hồ sơ (VD PAKN → PAKN-2026-00001), duy nhất trong các bản ghi chưa xoá, không đổi sau khi tạo',
    category          VARCHAR(100)  NULL COMMENT 'Nhóm nghiệp vụ',
    description       VARCHAR(1000) NULL,
    owner_org_id      BIGINT        NULL COMMENT 'Đơn vị sở hữu (org_unit.id)',
    active_version_id BIGINT        NULL COMMENT 'Phiên bản đang hiệu lực (template_version.id), NULL = chưa publish',
    status            VARCHAR(20)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT | ACTIVE | INACTIVE',
    deleted           TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    tenant_id         VARCHAR(100)  NULL,
    realm             VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id          VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at        DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by        VARCHAR(100)  NULL,
    updated_at        DATETIME(3)   NULL COMMENT 'UTC',
    updated_by        VARCHAR(100)  NULL,
    row_version       BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock: chống 2 người lưu đè lên nhau',
    -- Cột ảo = giá trị gốc khi chưa xoá, NULL khi đã xoá: cho phép tạo lại mã / tiền tố của bản ghi đã xoá mềm
    active_code             VARCHAR(100) AS (IF(deleted = 0, code, NULL)) PERSISTENT,
    active_case_code_prefix VARCHAR(20)  AS (IF(deleted = 0, case_code_prefix, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT ck_template_status CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
    UNIQUE KEY uk_template_active_code (active_code),
    UNIQUE KEY uk_template_active_case_prefix (active_case_code_prefix),
    KEY idx_template_status_updated (deleted, status, updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Quy trình nghiệp vụ (Template) thiết kế bằng Canvas';

-- template_version: các phiên bản của một Template (mô hình Canvas, BPMN sinh ra, Dynamic Input schema, deployment Flowable).
-- FE gửi JSON canvas (nodes, edges...), BE lưu nguyên văn ở model_json và trả lại để FE vẽ lại.
-- Mỗi Template có tối đa 1 bản PUBLISHED (đang hiệu lực) và tối đa 1 bản DRAFT (bản nháp đang sửa);
-- publish bản nháp thì bản PUBLISHED cũ chuyển sang ARCHIVED.
CREATE TABLE template_version (
    id                     BIGINT        NOT NULL COMMENT 'TSID',
    template_id            BIGINT        NOT NULL COMMENT 'template.id',
    version_no             INT           NOT NULL COMMENT 'Số phiên bản, tăng dần từ 1 trong từng Template',
    status                 VARCHAR(20)   NOT NULL COMMENT 'DRAFT | PUBLISHED | ARCHIVED',
    version_name           VARCHAR(255)  NULL COMMENT 'Tên phiên bản, trống thì FE hiển thị "Phiên bản <version_no>"',
    version_description    VARCHAR(1000) NULL COMMENT 'Mô tả thay đổi của phiên bản',
    model_json             LONGTEXT      NOT NULL COMMENT 'Mô hình Canvas (JSON) do FE gửi lên',
    bpmn_xml               LONGTEXT      NULL COMMENT 'BPMN sinh ra từ model_json khi publish',
    input_schema           LONGTEXT      NULL COMMENT 'Dynamic Input schema (JSON)',
    process_definition_key VARCHAR(255)  NULL COMMENT 'Key process definition bên Flowable',
    deployment_id          VARCHAR(64)   NULL COMMENT 'ACT_RE_DEPLOYMENT.ID_ bên Flowable',
    published_at           DATETIME(3)   NULL COMMENT 'UTC',
    published_by           VARCHAR(100)  NULL,
    tenant_id              VARCHAR(100)  NULL,
    realm                  VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id               VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at             DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by             VARCHAR(100)  NULL,
    updated_at             DATETIME(3)   NULL COMMENT 'UTC',
    updated_by             VARCHAR(100)  NULL,
    row_version            BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    -- Cột ảo = template_id khi đúng trạng thái, NULL khi khác: UNIQUE đảm bảo mỗi Template chỉ 1 bản nháp / 1 bản hiệu lực
    draft_template_id      BIGINT AS (IF(status = 'DRAFT', template_id, NULL)) PERSISTENT,
    published_template_id  BIGINT AS (IF(status = 'PUBLISHED', template_id, NULL)) PERSISTENT,
    PRIMARY KEY (id),
    CONSTRAINT fk_template_version_template FOREIGN KEY (template_id) REFERENCES template (id),
    CONSTRAINT ck_template_version_model_json CHECK (JSON_VALID(model_json)),
    CONSTRAINT ck_template_version_input_schema CHECK (input_schema IS NULL OR JSON_VALID(input_schema)),
    CONSTRAINT ck_template_version_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    UNIQUE KEY uk_template_version_no (template_id, version_no),
    UNIQUE KEY uk_template_version_draft (draft_template_id),
    UNIQUE KEY uk_template_version_published (published_template_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Phiên bản của Template';

-- user_account: bản sao đọc người dùng từ Keycloak, để phân việc và tra quản lý trực tiếp mà không gọi Keycloak mỗi lần.
CREATE TABLE user_account (
    id              BIGINT        NOT NULL COMMENT 'TSID',
    keycloak_id     VARCHAR(36)   NOT NULL COMMENT 'Id user Keycloak',
    username        VARCHAR(100)  NULL COMMENT 'Tên đăng nhập',
    full_name       VARCHAR(255)  NULL,
    email           VARCHAR(255)  NULL,
    org_unit_id     BIGINT        NULL COMMENT 'Đơn vị (org_unit.id)',
    manager_user    VARCHAR(36)   NULL COMMENT 'Keycloak id của quản lý trực tiếp',
    status          SMALLINT      NOT NULL DEFAULT 1 COMMENT '0 = INACTIVE, 1 = ACTIVE',
    synced_at       DATETIME(3)   NULL COMMENT 'Lần đồng bộ gần nhất từ Keycloak, UTC',
    kz_user_id      VARCHAR(100)  NULL,
    kz_account_id   VARCHAR(100)  NULL,
    vsa_user_login  VARCHAR(100)  NULL,
    description     VARCHAR(1000) NULL,
    tenant_id       VARCHAR(100)  NULL,
    realm           VARCHAR(100)  NULL COMMENT 'Realm Keycloak của user',
    group_id        VARCHAR(36)   NULL COMMENT 'Id group Keycloak của user',
    created_at      DATETIME(3)   NOT NULL COMMENT 'UTC',
    created_by      VARCHAR(100)  NULL,
    updated_at      DATETIME(3)   NULL COMMENT 'UTC',
    updated_by      VARCHAR(100)  NULL,
    row_version     BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_account_keycloak_id (keycloak_id),
    KEY idx_user_account_org_unit (org_unit_id),
    KEY idx_user_account_group_id (group_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Bản sao đọc người dùng từ Keycloak';
