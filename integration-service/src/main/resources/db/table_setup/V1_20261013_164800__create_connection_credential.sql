-- connection_credential: secret của connection (API key, password, token, client secret), quan hệ 1-1 với connection.
-- Secret mã hoá ở tầng ứng dụng bằng AES-256-GCM với master key CREDENTIAL_MASTER_KEY (không lưu trong DB),
-- AAD = connection_id nên không chép ciphertext sang connection khác được. API chỉ ghi, không bao giờ trả secret ra.
-- Bỏ connection.secret_ref (thiết kế cũ dùng Vault, chưa có dữ liệu).

CREATE TABLE connection_credential (
    id                BIGINT       NOT NULL COMMENT 'TSID',
    connection_id     BIGINT       NOT NULL COMMENT 'connection.id, quan hệ 1-1',
    secret_ciphertext LONGTEXT     NOT NULL COMMENT 'Base64(IV 12 byte + ciphertext + GCM tag), AES-256-GCM, AAD = connection_id',
    key_version       INT          NOT NULL COMMENT 'Phiên bản master key đã dùng để mã hoá',
    created_at        BIGINT       NOT NULL COMMENT 'Epoch millis',
    created_by        VARCHAR(100) NULL,
    updated_at        BIGINT       NULL COMMENT 'Epoch millis',
    updated_by        VARCHAR(100) NULL,
    row_version       BIGINT       NOT NULL DEFAULT 0 COMMENT 'Optimistic lock',
    PRIMARY KEY (id),
    UNIQUE KEY uk_connection_credential_connection (connection_id),
    CONSTRAINT fk_connection_credential_connection FOREIGN KEY (connection_id) REFERENCES connection (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Secret đã mã hoá của connection';

ALTER TABLE connection DROP COLUMN secret_ref;
