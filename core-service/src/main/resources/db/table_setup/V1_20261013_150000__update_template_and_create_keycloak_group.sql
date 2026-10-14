-- -----------------------------------------------------------------------------------------------------
-- Các thay đổi sau V1__20261001_170000_init, gộp một file. Mọi câu lệnh chạy lại nhiều lần không lỗi
-- (xoá dòng version này trong flyway_schema_history là chạy lại được):
--   - ADD / DROP ... IF [NOT] EXISTS, CREATE TABLE IF NOT EXISTS.
--   - Đổi thời gian DATETIME(3) → BIGINT epoch millis chỉ tính lại dòng còn ở dạng datetime (xem mục 2).
-- -----------------------------------------------------------------------------------------------------

-- 1. Loại kích hoạt và thời hạn xử lý (SLA) của quy trình.
-- Cột NULL vì quy trình đã tạo trước đó chưa có giá trị; API tạo mới bắt buộc truyền.
ALTER TABLE template
    ADD COLUMN IF NOT EXISTS trigger_type      VARCHAR(20)  NULL COMMENT 'MANUAL | AUTO | SCHEDULE | HYBRID' AFTER status,
    ADD COLUMN IF NOT EXISTS input_form_id     VARCHAR(100) NULL COMMENT 'Biểu mẫu dữ liệu đầu vào (MANUAL)' AFTER trigger_type,
    ADD COLUMN IF NOT EXISTS trigger_api_id    VARCHAR(100) NULL COMMENT 'API kích hoạt (AUTO)' AFTER input_form_id,
    ADD COLUMN IF NOT EXISTS schedule_type     VARCHAR(10)  NULL COMMENT 'ONCE | REPEAT (SCHEDULE)' AFTER trigger_api_id,
    ADD COLUMN IF NOT EXISTS schedule_run_date DATE         NULL COMMENT 'Ngày chạy (ONCE), giờ Việt Nam' AFTER schedule_type,
    ADD COLUMN IF NOT EXISTS schedule_run_time TIME         NULL COMMENT 'Giờ chạy, giờ Việt Nam' AFTER schedule_run_date,
    ADD COLUMN IF NOT EXISTS schedule_repeat   VARCHAR(20)  NULL COMMENT 'Chu kỳ lặp (REPEAT): DAILY' AFTER schedule_run_time,
    ADD COLUMN IF NOT EXISTS sla_value         INT          NULL COMMENT 'Thời hạn xử lý' AFTER schedule_repeat,
    ADD COLUMN IF NOT EXISTS sla_unit          VARCHAR(10)  NULL COMMENT 'MINUTE | HOUR | DAY' AFTER sla_value,
    ADD CONSTRAINT IF NOT EXISTS ck_template_trigger_type CHECK (trigger_type IN ('MANUAL', 'AUTO', 'SCHEDULE', 'HYBRID')),
    ADD CONSTRAINT IF NOT EXISTS ck_template_schedule_type CHECK (schedule_type IN ('ONCE', 'REPEAT')),
    ADD CONSTRAINT IF NOT EXISTS ck_template_sla_unit CHECK (sla_unit IN ('MINUTE', 'HOUR', 'DAY')),
    ADD CONSTRAINT IF NOT EXISTS ck_template_sla_value CHECK (sla_value > 0);

-- 2. Thời gian DATETIME(3) UTC → BIGINT epoch millis, đổi tại chỗ để giữ nguyên index:
-- DATETIME(3) → DECIMAL(20,3) (dạng yyyymmddhhmmss.fff) → tính millis → BIGINT.
-- Chạy lại: cột đã là BIGINT thì DECIMAL giữ nguyên số millis (< 10^13 tới năm 2286), còn dạng datetime luôn >= 10^13
-- (yyyymmddhhmmss có 14 chữ số), nên UPDATE chỉ tính lại dòng >= 10^13. TIMESTAMPDIFF tính thuần số học, không phụ thuộc time_zone.
ALTER TABLE template
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE template
SET created_at = IF(created_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000, created_at),
    updated_at = IF(updated_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000, updated_at);
ALTER TABLE template
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE template_version
    MODIFY published_at DECIMAL(20, 3) NULL,
    MODIFY created_at   DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at   DECIMAL(20, 3) NULL;
UPDATE template_version
SET published_at = IF(published_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', published_at) DIV 1000, published_at),
    created_at   = IF(created_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000, created_at),
    updated_at   = IF(updated_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000, updated_at);
ALTER TABLE template_version
    MODIFY published_at BIGINT NULL COMMENT 'Epoch millis',
    MODIFY created_at   BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at   BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE user_account
    MODIFY synced_at  DECIMAL(20, 3) NULL,
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE user_account
SET synced_at  = IF(synced_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', synced_at) DIV 1000, synced_at),
    created_at = IF(created_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000, created_at),
    updated_at = IF(updated_at >= 10000000000000, TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000, updated_at);
ALTER TABLE user_account
    MODIFY synced_at  BIGINT NULL COMMENT 'Lần đồng bộ gần nhất từ Keycloak, epoch millis',
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

-- 3. Một quy trình được có nhiều bản nháp (DRAFT) cùng lúc: sửa bản đang ban hành thì sinh phiên bản mới,
-- sửa bản ở trạng thái khác thì ghi đè chính bản đó.
-- Bỏ cột ảo published_template_id: "tối đa 1 bản PUBLISHED / quy trình" do ứng dụng đảm bảo
-- (ban hành bản mới thì chuyển bản PUBLISHED cũ sang ARCHIVED).
ALTER TABLE template_version
    DROP INDEX IF EXISTS uk_template_version_draft,
    DROP INDEX IF EXISTS uk_template_version_published,
    DROP COLUMN IF EXISTS draft_template_id,
    DROP COLUMN IF EXISTS published_template_id;

-- 4. Bỏ tiền tố mã hồ sơ của quy trình: không có trong tài liệu nghiệp vụ, chưa dùng để sinh mã.
-- Bỏ cột ảo active_code: mã quy trình trùng được kiểm ở ứng dụng theo cột deleted (quy trình chưa xoá).
-- Bỏ unique key + cột ảo trước vì cột ảo phụ thuộc case_code_prefix.
ALTER TABLE template
    DROP INDEX IF EXISTS uk_template_active_case_prefix,
    DROP INDEX IF EXISTS uk_template_active_code,
    DROP COLUMN IF EXISTS active_case_code_prefix,
    DROP COLUMN IF EXISTS active_code;
ALTER TABLE template
    DROP COLUMN IF EXISTS case_code_prefix;

-- 5. keycloak_group: đơn vị / phòng ban / nhóm, bản sao group Keycloak. Cấu trúc giữ nguyên như bảng KEYCLOAK_GROUP
-- của IPCC (KeycloakGroupEntity) để import dữ liệu export từ IPCC ở lần đầu; ProcessX chỉ đọc.
-- id là id group Keycloak; group cấp cao nhất không có parent_group.
CREATE TABLE IF NOT EXISTS keycloak_group (
    id               VARCHAR(36)   NOT NULL COMMENT 'Id group Keycloak',
    name             VARCHAR(255)  NULL COMMENT 'Tên group',
    parent_group     VARCHAR(36)   NULL COMMENT 'keycloak_group.id của group cha, trống = group cấp cao nhất',
    type             SMALLINT      NULL,
    code             VARCHAR(255)  NULL,
    group_source_id  VARCHAR(36)   NULL COMMENT 'Theo IPCC: group cấp cao nhất thì = id',
    status           SMALLINT      NULL,
    is_deleting      SMALLINT      NULL,
    realm_name       VARCHAR(255)  NULL COMMENT 'Realm Keycloak chứa group',
    create_time      BIGINT        NULL COMMENT 'Epoch millis',
    create_by        VARCHAR(255)  NULL,
    update_time      BIGINT        NULL COMMENT 'Epoch millis',
    update_by        VARCHAR(255)  NULL,
    PRIMARY KEY (id),
    KEY idx_keycloak_group_parent (parent_group),
    KEY idx_keycloak_group_realm_name (realm_name, name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Group Keycloak (đơn vị / phòng ban / nhóm), import từ IPCC';
