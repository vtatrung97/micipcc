-- -----------------------------------------------------------------------------------------------------
-- Khởi tạo database và user cho integration-service. DevOps chạy MỘT LẦN bằng tài khoản quản trị MariaDB.
-- Bảng do Flyway tạo khi app khởi động (src/main/resources/db/table_setup), KHÔNG tạo bảng ở đây.
-- -----------------------------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS integration_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Mật khẩu theo quy tắc <tênDB>#123 cho dev/local; staging/production DevOps đổi mật khẩu riêng.
-- Chỉ có quyền trên schema của mình (Architecture Design mục 2.1). Có quyền DDL vì Flyway chạy migration bằng user này;
-- nếu muốn tách, tạo user migration riêng và khai báo FLYWAY_USERNAME / FLYWAY_PASSWORD.
CREATE USER IF NOT EXISTS 'integration_service'@'%' IDENTIFIED BY 'integration_service#123';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON integration_service.* TO 'integration_service'@'%';
FLUSH PRIVILEGES;
