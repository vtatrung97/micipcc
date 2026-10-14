-- agent_group: nhóm agent, cấu trúc giữ nguyên như bảng agent_group của IPCC để import dữ liệu export từ IPCC.
CREATE TABLE IF NOT EXISTS agent_group (
    agent_group_id   VARCHAR(36)  NOT NULL COMMENT 'id nhom agent',
    agent_group_code VARCHAR(255) NOT NULL COMMENT 'ma code cua nhom agent',
    agent_group_name VARCHAR(255) NOT NULL COMMENT 'ten nhom agent',
    description      VARCHAR(500) DEFAULT NULL COMMENT 'mo ta nhom agent',
    realm_name       VARCHAR(36)  NOT NULL COMMENT 'ten tenant',
    kz_account_id    VARCHAR(255) NOT NULL COMMENT 'id tai khoan tren kazoo',
    group_id         VARCHAR(36)  NOT NULL COMMENT 'id chu dich vu',
    status           TINYINT(4)   NOT NULL COMMENT 'trang thai',
    create_time      BIGINT(20)   NOT NULL COMMENT 'thoi gian tao',
    create_by        VARCHAR(255) NOT NULL COMMENT 'nguoi tao',
    update_time      BIGINT(20)   DEFAULT NULL COMMENT 'thoi gian chinh sua',
    update_by        VARCHAR(255) DEFAULT NULL COMMENT 'nguoi chinh sua',
    AGENT_LEADER_ID  VARCHAR(36)  DEFAULT NULL,
    ipcc_src         VARCHAR(10)  DEFAULT NULL,
    ipcc_ver         INT(11)      DEFAULT NULL,
    PRIMARY KEY (agent_group_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'bang cau hinh nhom agent';
