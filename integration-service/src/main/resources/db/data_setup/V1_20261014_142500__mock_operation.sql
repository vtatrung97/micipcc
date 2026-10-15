-- -----------------------------------------------------------------------------------------------------
-- Dữ liệu mock cho integration_service, phủ đủ các bảng / cột / giá trị enum để test màn hình và API:
--   user_account → external_system → connection → operation → execution_log, inbound_request.
-- Tên file không theo mẫu V<version>__*.sql nên Flyway KHÔNG tự chạy. Chạy tay trên DB dev:
--   mysql -h localhost -P 3307 -u integration_service -p integration_service < mock_operation.sql
-- Chạy lại không lỗi (INSERT IGNORE theo id cố định 9000000000000xxxxx).
-- Quy ước giống ứng dụng:
--   - Thời gian là epoch millis, tính lùi từ lúc chạy script để dữ liệu luôn "gần đây".
--   - created_by / updated_by = Keycloak id (sub) của người dùng, 'system' với job nền.
--   - JSON khớp DTO: AuthConfigData, CircuitBreakerConfigData, RetryPolicyData, OperationInputParam,
--     OperationOutputParam. requestMapping dùng $input.<name>, responseMapping dùng $response.
-- KHÔNG mock connection_credential: secret phải mã hoá AES-256-GCM bằng CREDENTIAL_MASTER_KEY của từng máy,
-- ciphertext giả sẽ làm hasSecret = true nhưng giải mã lỗi. Đặt secret qua API sửa connection.
-- Xoá: xem khối DELETE ở cuối file.
-- -----------------------------------------------------------------------------------------------------

-- Một câu SET duy nhất. Trong DBeaver chạy cả file bằng Execute SQL Script (Alt+X), không dùng Ctrl+Enter.
SET @now     = CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED),
    @min     = 60000,
    @hour    = 3600000,
    @day     = 86400000,
    @realm   = 'vcx',
    @tenant  = 'vcx',
    @group   = '7f3c2a10-0000-4000-8000-000000000001',
    @admin   = '00000000-0000-4000-8000-000000000001',
    @dev     = '00000000-0000-4000-8000-000000000002',
    @analyst = '00000000-0000-4000-8000-000000000003';

-- -----------------------------------------------------------------------------------------------------
-- user_account: người tạo / sửa cấu hình (thường đồng bộ qua CDC, ở đây mock để created_by hiển thị được tên)
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO user_account
    (id, keycloak_id, username, full_name, email, org_unit_id, manager_user, status, synced_at,
     kz_user_id, kz_account_id, vsa_user_login, description, tenant_id, realm, group_id,
     created_at, created_by, updated_at, updated_by, row_version)
VALUES
    (900000000000000001, @admin, 'admin.tf', 'Nguyễn Văn Quản Trị', 'admin.tf@vcx.vn', NULL, NULL, 1, @now - @hour,
     'kz-user-0001', 'kz-acc-vcx', 'admin.tf', 'Quản trị cấu hình tích hợp', @tenant, @realm, @group,
     @now - 30 * @day, 'system', @now - @hour, 'system', 3),
    (900000000000000002, @dev, 'dev.integration', 'Trần Thị Tích Hợp', 'dev.integration@vcx.vn', NULL, @admin, 1, @now - @hour,
     'kz-user-0002', 'kz-acc-vcx', 'dev.integration', 'Khai báo API đối tác', @tenant, @realm, @group,
     @now - 30 * @day, 'system', @now - @hour, 'system', 2),
    (900000000000000003, @analyst, 'ba.flow', 'Lê Văn Phân Tích', 'ba.flow@vcx.vn', NULL, @admin, 1, @now - @hour,
     NULL, NULL, NULL, NULL, @tenant, @realm, @group,
     @now - 20 * @day, 'system', NULL, NULL, 0),
    (900000000000000004, '00000000-0000-4000-8000-000000000004', 'old.staff', 'Phạm Thị Nghỉ Việc', 'old.staff@vcx.vn',
     NULL, @admin, 0, @now - 5 * @day,
     NULL, NULL, NULL, 'Đã nghỉ việc', @tenant, @realm, @group,
     @now - 90 * @day, 'system', @now - 5 * @day, 'system', 1);

-- -----------------------------------------------------------------------------------------------------
-- external_system: đủ DEV / UAT / PROD / NULL, ACTIVE / INACTIVE, 1 bản ghi xoá mềm
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO external_system
    (id, code, name, environment, description, status, deleted, tenant_id, realm, group_id,
     created_at, created_by, updated_at, updated_by, row_version)
VALUES
    (900000000000000101, 'CRM', 'Hệ thống CRM', 'DEV', 'Quản lý thông tin khách hàng, khiếu nại', 'ACTIVE', 0,
     @tenant, @realm, @group, @now - 25 * @day, @admin, @now - 3 * @day, @dev, 2),
    (900000000000000102, 'SMS_GW', 'SMS Gateway', 'DEV', 'Gửi tin nhắn SMS', 'ACTIVE', 0,
     @tenant, @realm, @group, @now - 25 * @day, @admin, NULL, NULL, 0),
    (900000000000000103, 'CORE_BANKING', 'Core Banking', 'UAT', 'Tra cứu tài khoản, số dư', 'ACTIVE', 0,
     @tenant, @realm, @group, @now - 15 * @day, @dev, @now - 2 * @day, @dev, 1),
    (900000000000000104, 'EMAIL_SVC', 'Email Service', 'PROD', 'Gửi email thông báo', 'ACTIVE', 0,
     @tenant, @realm, @group, @now - 10 * @day, @dev, NULL, NULL, 0),
    (900000000000000105, 'LEGACY_ERP', 'ERP cũ', NULL, 'Tạm ngưng, chờ chuyển sang ERP mới', 'INACTIVE', 0,
     @tenant, @realm, @group, @now - 60 * @day, @admin, @now - 7 * @day, @admin, 4),
    (900000000000000106, 'OLD_HRM', 'HRM cũ', 'DEV', 'Đã xoá', 'INACTIVE', 1,
     @tenant, @realm, @group, @now - 80 * @day, @admin, @now - 40 * @day, @admin, 2);

-- -----------------------------------------------------------------------------------------------------
-- connection: đủ 5 auth_type, REST / SOAP, ACTIVE / INACTIVE, 1 bản ghi xoá mềm
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO connection
    (id, system_id, code, name, protocol, base_url, auth_type, auth_config, timeout_ms,
     rate_limit_per_second, circuit_breaker_config, status, deleted, tenant_id, realm, group_id,
     created_at, created_by, updated_at, updated_by, row_version)
VALUES
    (900000000000000111, 900000000000000101, 'CRM_REST', 'CRM REST API', 'REST', 'https://crm-dev.vcx.vn/api',
     'API_KEY', '{"headerName": "X-API-Key"}', 5000, 50,
     '{"failureRateThreshold": 50, "slowCallRateThreshold": 100, "slowCallDurationThresholdMs": 3000, "waitDurationInOpenStateMs": 30000, "slidingWindowSize": 20, "minimumNumberOfCalls": 10, "permittedNumberOfCallsInHalfOpenState": 3}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 25 * @day, @admin, @now - 3 * @day, @dev, 3),
    (900000000000000112, 900000000000000102, 'SMS_REST', 'SMS Gateway REST', 'REST', 'https://sms-dev.vcx.vn',
     'BEARER', NULL, 3000, NULL, NULL,
     'ACTIVE', 0, @tenant, @realm, @group, @now - 25 * @day, @admin, NULL, NULL, 0),
    (900000000000000113, 900000000000000103, 'CORE_OAUTH', 'Core Banking Open API', 'REST', 'https://openapi-uat.corebank.vn',
     'OAUTH2_CLIENT_CREDENTIALS',
     '{"tokenUrl": "https://sso-uat.corebank.vn/realms/partner/protocol/openid-connect/token", "clientId": "ticket-flow", "scope": "accounts.read"}',
     8000, 10, '{"failureRateThreshold": 30, "waitDurationInOpenStateMs": 60000}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 15 * @day, @dev, @now - 2 * @day, @dev, 1),
    (900000000000000114, 900000000000000103, 'CORE_SOAP', 'Core Banking SOAP (cũ)', 'SOAP', 'https://ws-uat.corebank.vn',
     'BASIC', '{"username": "tf_soap"}', 15000, NULL, NULL,
     'INACTIVE', 0, @tenant, @realm, @group, @now - 15 * @day, @dev, @now - 5 * @day, @admin, 2),
    (900000000000000115, 900000000000000104, 'EMAIL_REST', 'Email Service REST', 'REST', 'http://email-svc.internal:8080',
     'NONE', NULL, 10000, 20, NULL,
     'ACTIVE', 0, @tenant, @realm, @group, @now - 10 * @day, @dev, NULL, NULL, 0),
    (900000000000000116, 900000000000000105, 'ERP_REST', 'ERP REST', 'REST', 'https://erp-legacy.vcx.vn/rest',
     'BASIC', '{"username": "erp_integration"}', 20000, 5, NULL,
     'INACTIVE', 0, @tenant, @realm, @group, @now - 60 * @day, @admin, @now - 7 * @day, @admin, 1),
    (900000000000000117, 900000000000000101, 'CRM_REST_OLD', 'CRM REST (đã thay)', 'REST', 'https://crm-old.vcx.vn/api',
     'NONE', NULL, 5000, NULL, NULL,
     'INACTIVE', 1, @tenant, @realm, @group, @now - 50 * @day, @admin, @now - 25 * @day, @admin, 2);

-- -----------------------------------------------------------------------------------------------------
-- operation: đủ 5 http_method, DRAFT / ACTIVE / INACTIVE, nhiều version cùng mã, 1 bản ghi xoá mềm.
-- Biến {name} trên path / headers / query_params phải là input_params required (path) hoặc có khai báo.
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO operation
    (id, connection_id, code, version_no, name, description, http_method, path, headers, query_params,
     input_params, output_params, request_schema, response_schema, request_mapping, response_mapping,
     timeout_ms, retry_policy, status, deleted, tenant_id, realm, group_id,
     created_at, created_by, updated_at, updated_by, row_version)
VALUES
    -- CRM: tra cứu khách hàng v1 (ngừng dùng)
    (900000000000000121, 900000000000000111, 'GET_CUSTOMER', 1, 'Tra cứu khách hàng', 'Phiên bản cũ, chỉ có tên',
     'GET', '/v1/customers/{customerId}', '{"Accept": "application/json"}', NULL,
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true, "description": "Mã KH trên CRM"}]',
     '[{"name": "customerName", "label": "Tên khách hàng", "type": "STRING"}]',
     NULL,
     '{"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}}}',
     NULL, '{"customerName": $response.name}',
     NULL, NULL, 'INACTIVE', 0, @tenant, @realm, @group, @now - 25 * @day, @dev, @now - 10 * @day, @dev, 2),
    -- CRM: tra cứu khách hàng v2 (đang dùng)
    (900000000000000122, 900000000000000111, 'GET_CUSTOMER', 2, 'Tra cứu khách hàng', 'Thêm số điện thoại, hạng khách hàng',
     'GET', '/v2/customers/{customerId}', '{"Accept": "application/json", "X-Channel": "{channel}"}',
     '{"includeContacts": "{includeContacts}"}',
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true, "description": "Mã KH trên CRM"}, {"name": "channel", "label": "Kênh", "type": "STRING", "required": false, "defaultValue": "IPCC"}, {"name": "includeContacts", "label": "Lấy danh bạ liên hệ", "type": "BOOLEAN", "required": false, "defaultValue": true}]',
     '[{"name": "customerName", "label": "Tên khách hàng", "type": "STRING"}, {"name": "customerPhone", "label": "Số điện thoại", "type": "STRING"}, {"name": "customerTier", "label": "Hạng khách hàng", "type": "STRING", "description": "GOLD | SILVER | STANDARD"}, {"name": "contacts", "label": "Danh bạ liên hệ", "type": "ARRAY"}]',
     NULL,
     '{"type": "object", "required": ["id", "name"], "properties": {"id": {"type": "string"}, "name": {"type": "string"}, "phone": {"type": "string"}, "tier": {"type": "string"}, "contacts": {"type": "array"}}}',
     NULL,
     '{"customerName": $response.name, "customerPhone": $response.phone, "customerTier": $response.tier, "contacts": $response.contacts}',
     3000, '{"maxAttempts": 3, "backoffMs": 500, "backoffMultiplier": 2, "retryOnStatus": [502, 503, 504], "retryOnTimeout": true}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 10 * @day, @dev, @now - 10 * @day, @dev, 1),
    -- CRM: tra cứu khách hàng v3 (đang soạn bản mới)
    (900000000000000123, 900000000000000111, 'GET_CUSTOMER', 3, 'Tra cứu khách hàng', 'Thêm điểm tích luỹ',
     'GET', '/v3/customers/{customerId}', '{"Accept": "application/json"}', NULL,
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true}]',
     '[{"name": "customerName", "label": "Tên khách hàng", "type": "STRING"}, {"name": "loyaltyPoints", "label": "Điểm tích luỹ", "type": "NUMBER"}]',
     NULL, NULL, NULL, '{"customerName": $response.name, "loyaltyPoints": $response.loyalty.points}',
     NULL, NULL, 'DRAFT', 0, @tenant, @realm, @group, @now - 1 * @day, @dev, @now - 2 * @hour, @dev, 4),
    -- CRM: tạo phiếu khiếu nại
    (900000000000000124, 900000000000000111, 'CREATE_COMPLAINT', 1, 'Tạo phiếu khiếu nại', 'Tạo phiếu trên CRM từ ticket',
     'POST', '/v2/complaints', '{"Content-Type": "application/json"}', NULL,
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true}, {"name": "content", "label": "Nội dung", "type": "STRING", "required": true}, {"name": "category", "label": "Phân loại", "type": "STRING", "required": false, "defaultValue": "GENERAL"}, {"name": "receivedDate", "label": "Ngày tiếp nhận", "type": "DATE", "required": false}, {"name": "attachments", "label": "Tệp đính kèm", "type": "ARRAY", "required": false}]',
     '[{"name": "complaintId", "label": "Mã phiếu", "type": "STRING"}, {"name": "createdAt", "label": "Thời điểm tạo", "type": "DATE"}]',
     '{"type": "object", "required": ["customerId", "content"], "properties": {"customerId": {"type": "string"}, "content": {"type": "string"}, "category": {"type": "string"}, "receivedDate": {"type": "string"}, "attachments": {"type": "array"}}}',
     '{"type": "object", "properties": {"complaintId": {"type": "string"}, "createdAt": {"type": "string"}}}',
     '{"customerId": $input.customerId, "content": $input.content, "category": $input.category, "receivedDate": $input.receivedDate, "attachments": $input.attachments}',
     '{"complaintId": $response.complaintId, "createdAt": $response.createdAt}',
     NULL, '{"maxAttempts": 2, "backoffMs": 1000, "retryOnStatus": [503], "retryOnTimeout": false}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 20 * @day, @dev, @now - 20 * @day, @dev, 1),
    -- CRM: cập nhật trạng thái phiếu (PATCH, đang soạn)
    (900000000000000125, 900000000000000111, 'UPDATE_COMPLAINT_STATUS', 1, 'Cập nhật trạng thái phiếu', NULL,
     'PATCH', '/v2/complaints/{complaintId}/status', '{"Content-Type": "application/json"}', NULL,
     '[{"name": "complaintId", "label": "Mã phiếu", "type": "STRING", "required": true}, {"name": "status", "label": "Trạng thái mới", "type": "STRING", "required": true, "description": "OPEN | IN_PROGRESS | RESOLVED | CLOSED"}, {"name": "note", "label": "Ghi chú", "type": "STRING", "required": false}]',
     '[{"name": "updated", "label": "Đã cập nhật", "type": "BOOLEAN"}]',
     '{"type": "object", "required": ["status"], "properties": {"status": {"type": "string"}, "note": {"type": "string"}}}',
     NULL,
     '{"status": $input.status, "note": $input.note}', '{"updated": $response.success}',
     NULL, NULL, 'DRAFT', 0, @tenant, @realm, @group, @now - 2 * @day, @dev, @now - 3 * @hour, @dev, 5),
    -- CRM: cập nhật địa chỉ (PUT)
    (900000000000000126, 900000000000000111, 'UPDATE_CUSTOMER_ADDRESS', 1, 'Cập nhật địa chỉ khách hàng', NULL,
     'PUT', '/v2/customers/{customerId}/address', '{"Content-Type": "application/json"}', NULL,
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true}, {"name": "address", "label": "Địa chỉ", "type": "OBJECT", "required": true, "description": "{street, ward, district, province}"}]',
     '[{"name": "address", "label": "Địa chỉ sau cập nhật", "type": "OBJECT"}]',
     '{"type": "object", "required": ["street", "province"], "properties": {"street": {"type": "string"}, "ward": {"type": "string"}, "district": {"type": "string"}, "province": {"type": "string"}}}',
     NULL,
     '$input.address', NULL,
     4000, '{"maxAttempts": 1}', 'ACTIVE', 0, @tenant, @realm, @group, @now - 8 * @day, @dev, NULL, NULL, 0),
    -- CRM: gỡ tag khách hàng (DELETE, 2 biến path)
    (900000000000000127, 900000000000000111, 'REMOVE_CUSTOMER_TAG', 1, 'Gỡ tag khách hàng', NULL,
     'DELETE', '/v2/customers/{customerId}/tags/{tagCode}', NULL, NULL,
     '[{"name": "customerId", "label": "Mã khách hàng", "type": "STRING", "required": true}, {"name": "tagCode", "label": "Mã tag", "type": "STRING", "required": true}]',
     NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, 'ACTIVE', 0, @tenant, @realm, @group, @now - 8 * @day, @dev, NULL, NULL, 0),
    -- SMS: gửi tin nhắn
    (900000000000000128, 900000000000000112, 'SEND_SMS', 1, 'Gửi SMS', 'Gửi SMS thông báo cho khách hàng',
     'POST', '/sms/send', '{"Content-Type": "application/json"}', NULL,
     '[{"name": "phone", "label": "Số điện thoại", "type": "STRING", "required": true}, {"name": "message", "label": "Nội dung", "type": "STRING", "required": true}, {"name": "brandName", "label": "Brandname", "type": "STRING", "required": false, "defaultValue": "VCX"}, {"name": "scheduledAt", "label": "Hẹn giờ gửi", "type": "DATE", "required": false}]',
     '[{"name": "smsMessageId", "label": "Mã tin nhắn", "type": "STRING"}, {"name": "smsStatus", "label": "Trạng thái gửi", "type": "STRING"}]',
     '{"type": "object", "required": ["phone", "message"], "properties": {"phone": {"type": "string"}, "message": {"type": "string", "maxLength": 640}}}',
     '{"type": "object", "properties": {"messageId": {"type": "string"}, "status": {"type": "string"}}}',
     '{"to": $input.phone, "text": $input.message, "brandName": $input.brandName, "sendAt": $input.scheduledAt}',
     '{"smsMessageId": $response.messageId, "smsStatus": $response.status}',
     2000, '{"maxAttempts": 3, "backoffMs": 200, "backoffMultiplier": 1.5, "retryOnStatus": [500, 503], "retryOnTimeout": true}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 24 * @day, @admin, NULL, NULL, 0),
    -- SMS: huỷ tin hẹn giờ (đã xoá mềm)
    (900000000000000129, 900000000000000112, 'CANCEL_SMS', 1, 'Huỷ SMS hẹn giờ', NULL,
     'DELETE', '/sms/{messageId}', NULL, NULL,
     '[{"name": "messageId", "label": "Mã tin nhắn", "type": "STRING", "required": true}]',
     NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, 'INACTIVE', 1, @tenant, @realm, @group, @now - 24 * @day, @admin, @now - 12 * @day, @admin, 2),
    -- Core Banking: số dư tài khoản (OAuth2)
    (900000000000000130, 900000000000000113, 'GET_ACCOUNT_BALANCE', 1, 'Tra cứu số dư', 'Số dư khả dụng theo số tài khoản',
     'GET', '/accounts/{accountNo}/balance', '{"Accept": "application/json"}', '{"currency": "{currency}"}',
     '[{"name": "accountNo", "label": "Số tài khoản", "type": "STRING", "required": true}, {"name": "currency", "label": "Loại tiền", "type": "STRING", "required": false, "defaultValue": "VND"}]',
     '[{"name": "availableBalance", "label": "Số dư khả dụng", "type": "NUMBER"}, {"name": "currency", "label": "Loại tiền", "type": "STRING"}, {"name": "isLocked", "label": "Tài khoản bị khoá", "type": "BOOLEAN"}]',
     NULL,
     '{"type": "object", "properties": {"available": {"type": "number"}, "currency": {"type": "string"}, "locked": {"type": "boolean"}}}',
     NULL,
     '{"availableBalance": $response.available, "currency": $response.currency, "isLocked": $response.locked}',
     6000, '{"maxAttempts": 2, "backoffMs": 1000, "retryOnStatus": [502, 503, 504], "retryOnTimeout": true}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 14 * @day, @dev, @now - 2 * @day, @dev, 1),
    -- Core Banking SOAP: tra cứu tài khoản (connection đã tạm ngưng)
    (900000000000000131, 900000000000000114, 'GET_ACCOUNT_SOAP', 1, 'Tra cứu tài khoản (SOAP)', 'Giữ lại để đối chiếu',
     'POST', '/ws/AccountService', '{"Content-Type": "text/xml; charset=utf-8", "SOAPAction": "getAccount"}', NULL,
     '[{"name": "accountNo", "label": "Số tài khoản", "type": "STRING", "required": true}]',
     '[{"name": "accountName", "label": "Tên chủ tài khoản", "type": "STRING"}]',
     NULL, NULL,
     '"<soapenv:Envelope xmlns:soapenv=\\"http://schemas.xmlsoap.org/soap/envelope/\\"><soapenv:Body><getAccount><accountNo>" & $input.accountNo & "</accountNo></getAccount></soapenv:Body></soapenv:Envelope>"',
     '{"accountName": $response.Envelope.Body.getAccountResponse.accountName}',
     15000, NULL, 'INACTIVE', 0, @tenant, @realm, @group, @now - 15 * @day, @dev, @now - 5 * @day, @admin, 1),
    -- Email: gửi email (connection NONE)
    (900000000000000132, 900000000000000115, 'SEND_EMAIL', 1, 'Gửi email', 'Gửi email theo template',
     'POST', '/v1/mail/send', '{"Content-Type": "application/json", "X-Template": "{templateCode}"}', NULL,
     '[{"name": "to", "label": "Người nhận", "type": "ARRAY", "required": true}, {"name": "templateCode", "label": "Mã template", "type": "STRING", "required": true}, {"name": "params", "label": "Tham số template", "type": "OBJECT", "required": false}, {"name": "highPriority", "label": "Ưu tiên cao", "type": "BOOLEAN", "required": false, "defaultValue": false}, {"name": "retryCount", "label": "Số lần gửi lại", "type": "NUMBER", "required": false, "defaultValue": 0}]',
     '[{"name": "mailId", "label": "Mã email", "type": "STRING"}, {"name": "accepted", "label": "Số người nhận hợp lệ", "type": "NUMBER"}]',
     '{"type": "object", "required": ["to"], "properties": {"to": {"type": "array", "items": {"type": "string"}}, "params": {"type": "object"}}}',
     NULL,
     '{"to": $input.to, "params": $input.params, "priority": $input.highPriority ? "HIGH" : "NORMAL", "retry": $input.retryCount}',
     '{"mailId": $response.id, "accepted": $count($response.accepted)}',
     NULL, '{"maxAttempts": 5, "backoffMs": 2000, "backoffMultiplier": 2, "retryOnStatus": [429, 500, 502, 503], "retryOnTimeout": true}',
     'ACTIVE', 0, @tenant, @realm, @group, @now - 9 * @day, @dev, NULL, NULL, 0),
    -- ERP cũ: hoá đơn (hệ thống đã tạm ngưng)
    (900000000000000133, 900000000000000116, 'GET_INVOICE', 1, 'Tra cứu hoá đơn', NULL,
     'GET', '/invoices/{invoiceNo}', NULL, NULL,
     '[{"name": "invoiceNo", "label": "Số hoá đơn", "type": "STRING", "required": true}]',
     '[{"name": "amount", "label": "Số tiền", "type": "NUMBER"}, {"name": "issuedDate", "label": "Ngày xuất", "type": "DATE"}]',
     NULL, NULL, NULL, '{"amount": $response.total, "issuedDate": $response.issued}',
     NULL, NULL, 'INACTIVE', 0, @tenant, @realm, @group, @now - 60 * @day, @admin, @now - 7 * @day, @admin, 1);

-- -----------------------------------------------------------------------------------------------------
-- execution_log: đủ SUCCESS / FAILURE / TIMEOUT, có chuỗi retry cùng correlation_id. Chỉ ghi thêm, không có updated_*.
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO execution_log
    (id, system_id, connection_id, operation_id, flow_instance_id, activity_id, correlation_id, request_id,
     attempt_no, status, http_method, request_url, http_status, duration_ms,
     request_headers, request_body, response_body, error_code, error_message,
     started_at, finished_at, tenant_id, realm, group_id, created_at, created_by)
VALUES
    -- Tra cứu KH thành công
    (900000000000000201, 900000000000000101, 900000000000000111, 900000000000000122,
     'a1b2c3d4-0001-11f0-9c1a-0242ac120002', 'Activity_GetCustomer', 'corr-0001', 'req-0001',
     1, 'SUCCESS', 'GET', 'https://crm-dev.vcx.vn/api/v2/customers/KH000123?includeContacts=true', 200, 182,
     '{"Accept": "application/json", "X-Channel": "IPCC", "X-API-Key": "***"}', NULL,
     '{"id": "KH000123", "name": "Nguyễn Văn A", "phone": "09******89", "tier": "GOLD", "contacts": []}', NULL, NULL,
     @now - 2 * @hour, @now - 2 * @hour + 182, @tenant, @realm, @group, @now - 2 * @hour, 'system'),
    -- Tra cứu KH: không tồn tại
    (900000000000000202, 900000000000000101, 900000000000000111, 900000000000000122,
     'a1b2c3d4-0002-11f0-9c1a-0242ac120002', 'Activity_GetCustomer', 'corr-0002', 'req-0002',
     1, 'FAILURE', 'GET', 'https://crm-dev.vcx.vn/api/v2/customers/KH999999?includeContacts=true', 404, 95,
     '{"Accept": "application/json", "X-Channel": "IPCC", "X-API-Key": "***"}', NULL,
     '{"error": "CUSTOMER_NOT_FOUND", "message": "Customer KH999999 not found"}', 'HTTP_404', 'Không tìm thấy khách hàng',
     @now - 90 * @min, @now - 90 * @min + 95, @tenant, @realm, @group, @now - 90 * @min, 'system'),
    -- Tạo khiếu nại: lần 1 lỗi 503, lần 2 thành công (retry)
    (900000000000000203, 900000000000000101, 900000000000000111, 900000000000000124,
     'a1b2c3d4-0003-11f0-9c1a-0242ac120002', 'Activity_CreateComplaint', 'corr-0003', 'req-0003',
     1, 'FAILURE', 'POST', 'https://crm-dev.vcx.vn/api/v2/complaints', 503, 1204,
     '{"Content-Type": "application/json", "X-API-Key": "***"}',
     '{"customerId": "KH000123", "content": "Cước tháng 9 bị tính sai", "category": "BILLING"}',
     '{"error": "SERVICE_UNAVAILABLE"}', 'HTTP_503', 'Service Unavailable',
     @now - 60 * @min, @now - 60 * @min + 1204, @tenant, @realm, @group, @now - 60 * @min, 'system'),
    (900000000000000204, 900000000000000101, 900000000000000111, 900000000000000124,
     'a1b2c3d4-0003-11f0-9c1a-0242ac120002', 'Activity_CreateComplaint', 'corr-0003', 'req-0003',
     2, 'SUCCESS', 'POST', 'https://crm-dev.vcx.vn/api/v2/complaints', 201, 340,
     '{"Content-Type": "application/json", "X-API-Key": "***"}',
     '{"customerId": "KH000123", "content": "Cước tháng 9 bị tính sai", "category": "BILLING"}',
     '{"complaintId": "CP-2026-000045", "createdAt": "2026-10-14T08:15:02Z"}', NULL, NULL,
     @now - 58 * @min, @now - 58 * @min + 340, @tenant, @realm, @group, @now - 58 * @min, 'system'),
    -- Gửi SMS thành công
    (900000000000000205, 900000000000000102, 900000000000000112, 900000000000000128,
     'a1b2c3d4-0003-11f0-9c1a-0242ac120002', 'Activity_SendSms', 'corr-0004', 'req-0004',
     1, 'SUCCESS', 'POST', 'https://sms-dev.vcx.vn/sms/send', 200, 76,
     '{"Content-Type": "application/json", "Authorization": "***"}',
     '{"to": "09******89", "text": "Phiếu CP-2026-000045 đã được tiếp nhận", "brandName": "VCX"}',
     '{"messageId": "SMS-88812", "status": "QUEUED"}', NULL, NULL,
     @now - 57 * @min, @now - 57 * @min + 76, @tenant, @realm, @group, @now - 57 * @min, 'system'),
    -- Gửi SMS: timeout cả 3 lần
    (900000000000000206, 900000000000000102, 900000000000000112, 900000000000000128,
     'a1b2c3d4-0004-11f0-9c1a-0242ac120002', 'Activity_SendSms', 'corr-0005', 'req-0005',
     1, 'TIMEOUT', 'POST', 'https://sms-dev.vcx.vn/sms/send', NULL, 2000,
     '{"Content-Type": "application/json", "Authorization": "***"}', '{"to": "09******12", "text": "Nhắc lịch hẹn"}',
     NULL, 'TIMEOUT', 'Read timed out after 2000 ms',
     @now - 40 * @min, @now - 40 * @min + 2000, @tenant, @realm, @group, @now - 40 * @min, 'system'),
    (900000000000000207, 900000000000000102, 900000000000000112, 900000000000000128,
     'a1b2c3d4-0004-11f0-9c1a-0242ac120002', 'Activity_SendSms', 'corr-0005', 'req-0005',
     2, 'TIMEOUT', 'POST', 'https://sms-dev.vcx.vn/sms/send', NULL, 2001,
     '{"Content-Type": "application/json", "Authorization": "***"}', '{"to": "09******12", "text": "Nhắc lịch hẹn"}',
     NULL, 'TIMEOUT', 'Read timed out after 2000 ms',
     @now - 40 * @min + 2200, @now - 40 * @min + 4201, @tenant, @realm, @group, @now - 40 * @min + 2200, 'system'),
    (900000000000000208, 900000000000000102, 900000000000000112, 900000000000000128,
     'a1b2c3d4-0004-11f0-9c1a-0242ac120002', 'Activity_SendSms', 'corr-0005', 'req-0005',
     3, 'TIMEOUT', 'POST', 'https://sms-dev.vcx.vn/sms/send', NULL, 2000,
     '{"Content-Type": "application/json", "Authorization": "***"}', '{"to": "09******12", "text": "Nhắc lịch hẹn"}',
     NULL, 'TIMEOUT', 'Read timed out after 2000 ms, hết số lần thử',
     @now - 40 * @min + 4500, @now - 40 * @min + 6500, @tenant, @realm, @group, @now - 40 * @min + 4500, 'system'),
    -- Số dư tài khoản thành công
    (900000000000000209, 900000000000000103, 900000000000000113, 900000000000000130,
     'a1b2c3d4-0005-11f0-9c1a-0242ac120002', 'Activity_GetBalance', 'corr-0006', 'req-0006',
     1, 'SUCCESS', 'GET', 'https://openapi-uat.corebank.vn/accounts/0011001234567/balance?currency=VND', 200, 410,
     '{"Accept": "application/json", "Authorization": "***"}', NULL,
     '{"available": 15250000, "currency": "VND", "locked": false}', NULL, NULL,
     @now - 1 * @day, @now - 1 * @day + 410, @tenant, @realm, @group, @now - 1 * @day, 'system'),
    -- Số dư: lỗi lấy token OAuth2 (không có http_status của API)
    (900000000000000210, 900000000000000103, 900000000000000113, 900000000000000130,
     'a1b2c3d4-0006-11f0-9c1a-0242ac120002', 'Activity_GetBalance', 'corr-0007', 'req-0007',
     1, 'FAILURE', 'GET', 'https://openapi-uat.corebank.vn/accounts/0011007654321/balance?currency=VND', 401, 230,
     '{"Accept": "application/json", "Authorization": "***"}', NULL,
     '{"error": "invalid_client"}', 'AUTH_FAILED', 'Lấy access token thất bại: invalid_client',
     @now - 20 * @hour, @now - 20 * @hour + 230, @tenant, @realm, @group, @now - 20 * @hour, 'system'),
    -- Gửi email: không kết nối được
    (900000000000000211, 900000000000000104, 900000000000000115, 900000000000000132,
     'a1b2c3d4-0007-11f0-9c1a-0242ac120002', 'Activity_SendEmail', 'corr-0008', 'req-0008',
     1, 'FAILURE', 'POST', 'http://email-svc.internal:8080/v1/mail/send', NULL, 12,
     '{"Content-Type": "application/json", "X-Template": "TICKET_CLOSED"}',
     '{"to": ["kh***@gmail.com"], "params": {"ticketCode": "TK-000210"}, "priority": "NORMAL", "retry": 0}',
     NULL, 'CONNECT_REFUSED', 'Connection refused: email-svc.internal/10.0.3.15:8080',
     @now - 5 * @hour, @now - 5 * @hour + 12, @tenant, @realm, @group, @now - 5 * @hour, 'system'),
    -- Gửi email thành công, gọi trực tiếp không qua Flow (test API)
    (900000000000000212, 900000000000000104, 900000000000000115, 900000000000000132,
     NULL, NULL, NULL, 'req-0009',
     1, 'SUCCESS', 'POST', 'http://email-svc.internal:8080/v1/mail/send', 202, 58,
     '{"Content-Type": "application/json", "X-Template": "TEST"}',
     '{"to": ["dev.integration@vcx.vn"], "params": {}, "priority": "HIGH", "retry": 0}',
     '{"id": "MAIL-5521", "accepted": ["dev.integration@vcx.vn"]}', NULL, NULL,
     @now - 3 * @hour, @now - 3 * @hour + 58, @tenant, @realm, @group, @now - 3 * @hour, @dev);

-- -----------------------------------------------------------------------------------------------------
-- inbound_request: đủ RECEIVED / PROCESSING / COMPLETED / FAILED, 1 bản ghi đã hết hạn idempotency
-- -----------------------------------------------------------------------------------------------------
INSERT IGNORE INTO inbound_request
    (id, client_id, idempotency_key, template_code, payload, status, flow_instance_id, response_body,
     error_code, error_message, processed_at, expires_at, tenant_id, realm, group_id,
     created_at, created_by, updated_at, updated_by, row_version)
VALUES
    (900000000000000301, 'partner-crm', '6f1d2c3b-0001-4a5e-9f00-000000000001', 'COMPLAINT_HANDLING',
     '{"customerId": "KH000123", "subject": "Cước tháng 9 bị tính sai", "channel": "CRM"}',
     'COMPLETED', 'a1b2c3d4-0003-11f0-9c1a-0242ac120002',
     '{"flowInstanceId": "a1b2c3d4-0003-11f0-9c1a-0242ac120002", "ticketCode": "TK-000201"}',
     NULL, NULL, @now - 61 * @min, @now - 61 * @min + 24 * @hour, @tenant, @realm, @group,
     @now - 62 * @min, 'service:partner-crm', @now - 61 * @min, 'service:partner-crm', 2),
    (900000000000000302, 'partner-crm', '6f1d2c3b-0002-4a5e-9f00-000000000002', 'COMPLAINT_HANDLING',
     '{"customerId": "KH000456", "subject": "Không gọi được tổng đài", "channel": "CRM"}',
     'PROCESSING', NULL, NULL,
     NULL, NULL, NULL, @now - 1 * @min + 24 * @hour, @tenant, @realm, @group,
     @now - 1 * @min, 'service:partner-crm', @now - 1 * @min, 'service:partner-crm', 1),
    (900000000000000303, 'partner-shop', 'ORDER-778812', 'ORDER_RETURN',
     '{"orderNo": "ORDER-778812", "reason": "Sản phẩm lỗi", "items": [{"sku": "SKU-01", "qty": 1}]}',
     'RECEIVED', NULL, NULL,
     NULL, NULL, NULL, @now + 24 * @hour, @tenant, @realm, @group,
     @now, 'service:partner-shop', NULL, NULL, 0),
    (900000000000000304, 'partner-shop', 'ORDER-778700', 'UNKNOWN_TEMPLATE',
     '{"orderNo": "ORDER-778700"}',
     'FAILED', NULL, '{"code": "TEMPLATE_NOT_FOUND", "message": "Không tìm thấy quy trình UNKNOWN_TEMPLATE"}',
     'TEMPLATE_NOT_FOUND', 'Không tìm thấy quy trình UNKNOWN_TEMPLATE', @now - 4 * @hour, @now - 4 * @hour + 24 * @hour,
     @tenant, @realm, @group, @now - 4 * @hour, 'service:partner-shop', @now - 4 * @hour, 'service:partner-shop', 1),
    -- Đã hết hạn giữ idempotency (job dọn dẹp sẽ xoá)
    (900000000000000305, 'partner-crm', '6f1d2c3b-0000-4a5e-9f00-000000000099', 'COMPLAINT_HANDLING',
     '{"customerId": "KH000001", "subject": "Yêu cầu cũ"}',
     'COMPLETED', 'a1b2c3d4-0000-11f0-9c1a-0242ac120002',
     '{"flowInstanceId": "a1b2c3d4-0000-11f0-9c1a-0242ac120002", "ticketCode": "TK-000100"}',
     NULL, NULL, @now - 3 * @day, @now - 2 * @day, @tenant, @realm, @group,
     @now - 3 * @day, 'service:partner-crm', @now - 3 * @day, 'service:partner-crm', 2);

-- -----------------------------------------------------------------------------------------------------
-- Xoá dữ liệu mock (theo thứ tự FK):
-- DELETE FROM inbound_request WHERE id BETWEEN 900000000000000301 AND 900000000000000399;
-- DELETE FROM execution_log   WHERE id BETWEEN 900000000000000201 AND 900000000000000299;
-- DELETE FROM operation       WHERE id BETWEEN 900000000000000121 AND 900000000000000199;
-- DELETE FROM connection_credential WHERE connection_id BETWEEN 900000000000000111 AND 900000000000000119;
-- DELETE FROM connection      WHERE id BETWEEN 900000000000000111 AND 900000000000000119;
-- DELETE FROM external_system WHERE id BETWEEN 900000000000000101 AND 900000000000000109;
-- DELETE FROM user_account    WHERE id BETWEEN 900000000000000001 AND 900000000000000099;
-- -----------------------------------------------------------------------------------------------------
