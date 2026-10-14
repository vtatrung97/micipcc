-- -----------------------------------------------------------------------------------------------------
-- Dữ liệu mock cho integration_service: external_system → connection → operation (OperationEntity).
-- Flyway data_setup. Chạy lại không lỗi (INSERT IGNORE theo id cố định).
-- Xoá: DELETE theo id 9000000000000001xx (operation trước, rồi connection, rồi external_system).
-- -----------------------------------------------------------------------------------------------------

INSERT IGNORE INTO external_system
    (id, code, name, environment, description, status, deleted, realm, created_at, created_by, row_version)
VALUES
    (900000000000000101, 'CRM',     'Hệ thống CRM',         'DEV', 'Quản lý thông tin khách hàng', 'ACTIVE', 0,
     'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    (900000000000000102, 'SMS_GW',  'SMS Gateway',          'DEV', 'Gửi tin nhắn SMS',             'ACTIVE', 0,
     'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0);

INSERT IGNORE INTO connection
    (id, system_id, code, name, protocol, base_url, auth_type, auth_config, timeout_ms,
     rate_limit_per_second, circuit_breaker_config, status, deleted, realm, created_at, created_by, row_version)
VALUES
    (900000000000000111, 900000000000000101, 'CRM_REST', 'CRM REST API', 'REST', 'https://crm-dev.vcx.vn/api',
     'API_KEY', '{"headerName": "X-API-Key"}', 5000,
     50, '{"failureRateThreshold": 50, "waitDurationInOpenStateMs": 30000}', 'ACTIVE', 0,
     'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    (900000000000000112, 900000000000000102, 'SMS_REST', 'SMS Gateway REST', 'REST', 'https://sms-dev.vcx.vn',
     'BEARER', NULL, 3000,
     NULL, NULL, 'ACTIVE', 0,
     'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0);

INSERT IGNORE INTO operation
    (id, connection_id, code, version_no, name, description, http_method, path, headers, query_params,
     request_schema, response_schema, request_mapping, response_mapping, timeout_ms, retry_policy,
     status, deleted, realm, created_at, created_by, row_version)
VALUES
    -- CRM: tra cứu khách hàng, v1 ngừng dùng, v2 đang dùng
    (900000000000000121, 900000000000000111, 'GET_CUSTOMER', 1, 'Tra cứu khách hàng', 'Phiên bản cũ',
     'GET', '/v1/customers/{customerId}', '{"Accept": "application/json"}', NULL,
     NULL, '{"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}}}',
     '{"customerId": customerId}', '{"customerName": name}', NULL, NULL,
     'INACTIVE', 0, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    (900000000000000122, 900000000000000111, 'GET_CUSTOMER', 2, 'Tra cứu khách hàng', 'Thêm số điện thoại, hạng khách hàng',
     'GET', '/v2/customers/{customerId}', '{"Accept": "application/json"}', '{"includeContacts": true}',
     NULL, '{"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}, "phone": {"type": "string"}, "tier": {"type": "string"}}}',
     '{"customerId": customerId}', '{"customerName": name, "customerPhone": phone, "customerTier": tier}', 3000,
     '{"maxAttempts": 3, "backoffMs": 500, "retryOn": [502, 503, 504]}',
     'ACTIVE', 0, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    -- CRM: tạo phiếu khiếu nại
    (900000000000000123, 900000000000000111, 'CREATE_COMPLAINT', 1, 'Tạo phiếu khiếu nại', NULL,
     'POST', '/v2/complaints', '{"Content-Type": "application/json"}', NULL,
     '{"type": "object", "required": ["customerId", "content"], "properties": {"customerId": {"type": "string"}, "content": {"type": "string"}}}',
     '{"type": "object", "properties": {"complaintId": {"type": "string"}}}',
     '{"customerId": customerId, "content": complaintContent}', '{"complaintId": complaintId}', NULL,
     '{"maxAttempts": 2, "backoffMs": 1000, "retryOn": [503]}',
     'ACTIVE', 0, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    -- CRM: cập nhật trạng thái phiếu, đang soạn
    (900000000000000124, 900000000000000111, 'UPDATE_COMPLAINT_STATUS', 1, 'Cập nhật trạng thái phiếu', NULL,
     'PUT', '/v2/complaints/{complaintId}/status', '{"Content-Type": "application/json"}', NULL,
     '{"type": "object", "properties": {"status": {"type": "string"}}}', NULL,
     '{"status": newStatus}', NULL, NULL, NULL,
     'DRAFT', 0, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    -- SMS: gửi tin nhắn
    (900000000000000125, 900000000000000112, 'SEND_SMS', 1, 'Gửi SMS', 'Gửi SMS thông báo cho khách hàng',
     'POST', '/sms/send', '{"Content-Type": "application/json"}', NULL,
     '{"type": "object", "required": ["phone", "message"], "properties": {"phone": {"type": "string"}, "message": {"type": "string"}}}',
     '{"type": "object", "properties": {"messageId": {"type": "string"}, "status": {"type": "string"}}}',
     '{"phone": customerPhone, "message": smsContent}', '{"smsMessageId": messageId, "smsStatus": status}', 2000,
     '{"maxAttempts": 3, "backoffMs": 200, "retryOn": [500, 503]}',
     'ACTIVE', 0, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    -- SMS: huỷ tin hẹn giờ, đã xoá mềm
    (900000000000000126, 900000000000000112, 'CANCEL_SMS', 1, 'Huỷ SMS hẹn giờ', NULL,
     'DELETE', '/sms/{messageId}', NULL, NULL,
     NULL, NULL, '{"messageId": smsMessageId}', NULL, NULL, NULL,
     'INACTIVE', 1, 'vcx', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0);
