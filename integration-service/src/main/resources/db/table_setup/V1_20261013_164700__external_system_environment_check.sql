-- external_system.environment: chuyển từ text tự do sang enum Environment (DEV | UAT | PROD), NULL = không phân biệt.
-- Chuẩn hoá dữ liệu cũ trước khi thêm CHECK: viết hoa + bỏ khoảng trắng; giá trị ngoài danh sách đưa về NULL
-- (nếu không, ALTER sẽ lỗi trên môi trường đã có dữ liệu).

UPDATE external_system
SET environment = UPPER(TRIM(environment))
WHERE environment IS NOT NULL;

UPDATE external_system
SET environment = NULL
WHERE environment IS NOT NULL
  AND environment NOT IN ('DEV', 'UAT', 'PROD');

ALTER TABLE external_system
    MODIFY environment VARCHAR(20) NULL COMMENT 'Môi trường kết nối: DEV | UAT | PROD, NULL = không phân biệt',
    ADD CONSTRAINT ck_external_system_environment CHECK (environment IS NULL OR environment IN ('DEV', 'UAT', 'PROD'));
