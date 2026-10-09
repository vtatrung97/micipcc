-- Thời gian chuyển từ DATETIME(3) UTC sang BIGINT epoch millis.
-- Đổi tại chỗ để giữ nguyên khoá chính / index: DATETIME(3) → DECIMAL(20,3) (dạng yyyymmddhhmmss.fff) → tính millis → BIGINT.
-- TIMESTAMPDIFF tính thuần số học, không phụ thuộc time_zone của phiên.

ALTER TABLE external_system
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE external_system
SET created_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE external_system
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE connection
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE connection
SET created_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE connection
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE operation
    MODIFY created_at DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at DECIMAL(20, 3) NULL;
UPDATE operation
SET created_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE operation
    MODIFY created_at BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at BIGINT NULL COMMENT 'Epoch millis';

ALTER TABLE execution_log
    MODIFY started_at  DECIMAL(20, 3) NULL,
    MODIFY finished_at DECIMAL(20, 3) NULL,
    MODIFY created_at  DECIMAL(20, 3) NOT NULL;
UPDATE execution_log
SET started_at  = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', started_at) DIV 1000,
    finished_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', finished_at) DIV 1000,
    created_at  = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000;
ALTER TABLE execution_log
    MODIFY started_at  BIGINT NULL COMMENT 'Epoch millis',
    MODIFY finished_at BIGINT NULL COMMENT 'Epoch millis',
    MODIFY created_at  BIGINT NOT NULL COMMENT 'Epoch millis';

ALTER TABLE inbound_request
    MODIFY processed_at DECIMAL(20, 3) NULL,
    MODIFY expires_at   DECIMAL(20, 3) NOT NULL,
    MODIFY created_at   DECIMAL(20, 3) NOT NULL,
    MODIFY updated_at   DECIMAL(20, 3) NULL;
UPDATE inbound_request
SET processed_at = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', processed_at) DIV 1000,
    expires_at   = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', expires_at) DIV 1000,
    created_at   = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', created_at) DIV 1000,
    updated_at   = TIMESTAMPDIFF(MICROSECOND, '1970-01-01', updated_at) DIV 1000;
ALTER TABLE inbound_request
    MODIFY processed_at BIGINT NULL COMMENT 'Epoch millis',
    MODIFY expires_at   BIGINT NOT NULL COMMENT 'Hết hạn giữ idempotency, epoch millis',
    MODIFY created_at   BIGINT NOT NULL COMMENT 'Epoch millis',
    MODIFY updated_at   BIGINT NULL COMMENT 'Epoch millis';
