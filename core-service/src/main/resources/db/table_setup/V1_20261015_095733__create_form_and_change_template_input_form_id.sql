-- form: biểu mẫu nhập liệu. Mã duy nhất trong các bản ghi chưa xoá (kiểm ở ứng dụng).
CREATE TABLE IF NOT EXISTS form (
    id          BIGINT        NOT NULL COMMENT 'TSID',
    code        VARCHAR(100)  NOT NULL COMMENT 'Mã biểu mẫu, không đổi sau khi tạo',
    name        VARCHAR(255)  NOT NULL COMMENT 'Tên biểu mẫu',
    title       VARCHAR(500)  NOT NULL COMMENT 'Tiêu đề hiển thị',
    description VARCHAR(1000) NULL COMMENT 'Mô tả',
    deleted     TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Xoá mềm: 1 = đã xoá',
    tenant_id   VARCHAR(100)  NULL,
    realm       VARCHAR(100)  NULL COMMENT 'Realm Keycloak của người tạo',
    group_id    VARCHAR(36)   NULL COMMENT 'Id group Keycloak của người tạo',
    created_at  BIGINT        NOT NULL COMMENT 'Epoch millis',
    created_by  VARCHAR(100)  NULL,
    updated_at  BIGINT        NULL COMMENT 'Epoch millis',
    updated_by  VARCHAR(100)  NULL,
    row_version BIGINT        NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    PRIMARY KEY (id),
    KEY idx_form_code (deleted, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Biểu mẫu nhập liệu';

-- form_field: trường của biểu mẫu (1 form - n field), luôn lưu / xoá cùng biểu mẫu nên không có xoá mềm, audit.
-- options: danh sách lựa chọn riêng của từng trường, lưu JSON array chuỗi (VD ["VIP","KHTV"]), NULL với kiểu không có lựa chọn.
CREATE TABLE IF NOT EXISTS form_field (
    id        BIGINT       NOT NULL COMMENT 'TSID',
    form_id   BIGINT       NOT NULL COMMENT 'form.id',
    code      VARCHAR(100) NOT NULL COMMENT 'Mã trường, duy nhất trong biểu mẫu, khoá của dữ liệu nhập',
    name      VARCHAR(255) NOT NULL COMMENT 'Tên trường',
    data_type VARCHAR(50)  NOT NULL COMMENT 'Kiểu dữ liệu, VD TEXTBOX, COMBOBOX_SINGLE, COMBOBOX_MULTI',
    options   LONGTEXT     NULL COMMENT 'Danh sách lựa chọn (JSON array chuỗi)',
    position  INT          NOT NULL COMMENT 'Vị trí hiển thị',
    required  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Bắt buộc nhập',
    PRIMARY KEY (id),
    UNIQUE KEY uk_form_field_code (form_id, code),
    KEY idx_form_field_position (form_id, position),
    CONSTRAINT fk_form_field_form FOREIGN KEY (form_id) REFERENCES form (id),
    CONSTRAINT ck_form_field_options CHECK (options IS NULL OR JSON_VALID(options))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Trường của biểu mẫu';

-- template.input_form_id trỏ tới form.id (trước là VARCHAR tự do): giá trị không phải số không map được form nào → NULL rồi đổi kiểu.
UPDATE template SET input_form_id = NULL WHERE input_form_id IS NOT NULL AND input_form_id NOT REGEXP '^[0-9]+$';
ALTER TABLE template MODIFY COLUMN IF EXISTS input_form_id BIGINT NULL COMMENT 'Biểu mẫu dữ liệu đầu vào (MANUAL), form.id';
