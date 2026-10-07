# integration-service

Service tích hợp của Ticket Flow: khai báo và gọi hệ thống ngoài theo mô hình System → Connection → Operation → Action
(Architecture Design v1.1 mục 6, BR-INT-01…06). Gửi thông báo làm sau.

**Công nghệ:** Java 17, Spring Boot, MariaDB, Redis, Keycloak. Cấu trúc và quy ước giống `core-service`.

## Chạy local

```bash
# Tạo DB + user (một lần, tài khoản root)
mariadb -h localhost -P 3307 -uroot -p < src/main/resources/db/database_setup.sql
cp .env.example .env
./mvnw spring-boot:run
```

- API: `http://localhost:8090/api/v1/...`, actuator ở cổng `8091`
- Swagger UI: `http://localhost:8090/swagger-ui.html`
- DB `integration_service`, user `integration_service` / `integration_service#123`
- Keycloak: cấu hình đọc từ MinIO `keycloak-adapter-config-os/integration-service.json` (giống core-service)

## Bảng (Flyway `db/table_setup`)

| Bảng | Ý nghĩa |
|---|---|
| `external_system` | Hệ thống thứ 3: mã, tên, môi trường, trạng thái |
| `connection` | Endpoint gốc, loại xác thực, tham chiếu secret (Vault), rate limit, timeout, circuit breaker |
| `operation` | API được phép gọi: method, path, schema request/response, mapping, retry, version, trạng thái |
| `execution_log` | Lịch sử mọi lần gọi hệ thống ngoài (đã che dữ liệu nhạy cảm), PK `(id, created_at)` để phân mảnh theo tháng |
| `inbound_request` | Trigger nhận từ hệ thống ngoài, unique `client_id + idempotency_key` |

## API

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/v1/health-check` | Public, trạng thái db, redis... |
| GET | `/api/v1/integrations/operations` | Danh sách API (không phân trang), lọc theo `keyword` (tìm theo tên) |
