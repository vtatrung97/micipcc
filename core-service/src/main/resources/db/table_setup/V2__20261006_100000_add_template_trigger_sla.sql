-- Loại kích hoạt và thời hạn xử lý (SLA) của quy trình.
-- Cột NULL vì quy trình đã tạo trước đó chưa có giá trị; API tạo mới bắt buộc truyền.
-- IF NOT EXISTS: file được sửa sau khi đã chạy ở local (xoá dòng V2 trong flyway_schema_history để chạy lại).
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

-- Thời gian chuyển từ DATETIME(3) UTC sang BIGINT epoch millis.
-- Đổi tại chỗ để giữ nguyên index: DATETIME(3) → DECIMAL(20,3) (dạng yyyymmddhhmmss.fff) → tính millis → BIGINT.
-- TIMESTAMPDIFF tính thuần số học, không phụ thuộc time_zone của phiên.
ALTER TABLE template
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE template
SET created_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE template
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE template_version
    MODIFY published_at DECIMAL(20, 3) NULL,
    MODIFY created_at   DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at   DECIMAL(20, 3) NULL;
UPDATE template_version
SET published_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', published_at) DIV 1000,
    created_at   = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at   = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE template_version
    MODIFY published_at BIGINT NULL COMMENT 'Epoch millis',
    MODIFY created_at   BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at   BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE user_account
    MODIFY synced_at  DECIMAL(20, 3) NULL,
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE user_account
SET synced_at  = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', synced_at) DIV 1000,
    created_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE user_account
    MODIFY synced_at  BIGINT NULL COMMENT 'Lần đồng bộ gần nhất từ Keycloak, epoch millis',
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';
