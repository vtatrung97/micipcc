-- app_param: danh mục tham số dùng chung (VD nhóm quy trình), phân loại theo type, mỗi type một danh sách code/name.
-- Mã duy nhất trong cùng type. realm = realm Keycloak của người tạo (đọc từ token).
CREATE TABLE IF NOT EXISTS app_param (
    id          BIGINT       NOT NULL COMMENT 'TSID',
    type        VARCHAR(50)  NOT NULL COMMENT 'Loại tham số, VD TEMPLATE_CATEGORY',
    code        VARCHAR(100) NOT NULL COMMENT 'Mã, duy nhất trong cùng type',
    name        VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị',
    status      SMALLINT     NOT NULL DEFAULT 1 COMMENT '0 = INACTIVE, 1 = ACTIVE',
    realm       VARCHAR(100) NULL COMMENT 'Realm Keycloak của người tạo',
    created_at  BIGINT       NOT NULL COMMENT 'Epoch millis',
    created_by  VARCHAR(100) NULL,
    updated_at  BIGINT       NULL COMMENT 'Epoch millis',
    updated_by  VARCHAR(100) NULL,
    row_version BIGINT       NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_param_type_code (type, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Danh mục tham số dùng chung';
