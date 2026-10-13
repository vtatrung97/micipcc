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

## Cấu hình

| Biến môi trường | Ý nghĩa |
|---|---|
| `CREDENTIAL_MASTER_KEY` | **Bắt buộc, không có giá trị mặc định** (thiếu / sai định dạng thì service không start). Master key mã hoá secret của connection: base64 của 32 byte, sinh bằng `openssl rand -base64 32`. Mỗi môi trường (DEV/UAT/PROD) một key riêng, đặt trong K8s Secret, không commit. **Mất key = mất toàn bộ secret đã lưu** (phải nhập lại). Giá trị trong `.env.example` / `local.env` chỉ dùng local. |

## Bảng (Flyway `db/table_setup`)

| Bảng | Ý nghĩa |
|---|---|
| `external_system` | Hệ thống thứ 3: mã, tên, môi trường (`DEV` / `UAT` / `PROD`), trạng thái |
| `connection` | Kết nối tới một hệ thống: endpoint gốc, giao thức, loại xác thực + cấu hình không bí mật (`auth_config`), timeout, rate limit, circuit breaker |
| `connection_credential` | Secret của connection (1-1): API key / password / token / client secret, **mã hoá AES-256-GCM** (AAD = `connection_id`), kèm `key_version`. Chỉ ghi, API không bao giờ trả secret ra |
| `operation` | API được phép gọi qua kết nối: method, path, header, query, tham số đầu vào / giá trị đầu ra (`input_params`, `output_params`), schema request/response, mapping JSONata, retry, version, trạng thái |
| `execution_log` | Lịch sử mọi lần gọi hệ thống ngoài (đã che dữ liệu nhạy cảm), PK `(id, created_at)` để phân mảnh theo tháng |
| `inbound_request` | Trigger nhận từ hệ thống ngoài, unique `client_id + idempotency_key` |
| `user_account` | Bản sao đọc người dùng Keycloak, đồng bộ qua CDC |

## Quy tắc nghiệp vụ

- **Mã** (`code`): system duy nhất toàn hệ thống; connection duy nhất trong system; operation duy nhất trong connection (mọi version). Không đổi sau khi tạo. Chỉ tính bản ghi chưa xoá.
- **Trạng thái không cascade**: tắt system / connection không tự tắt cấp dưới. Một API chỉ **dùng được** (chọn trong Flow, gọi được) khi system, connection và API **cùng ACTIVE**; response trả kèm trạng thái cấp cha và `usable`.
- **Xoá**: xoá mềm. Không xoá được system còn connection, connection còn API. Xoá connection thì xoá hẳn secret của nó.
- **Version API**: tạo mới là bản nháp `DRAFT` version 1. Chỉ sửa / xoá được bản `DRAFT`; bản đã `ACTIVE` muốn đổi thì tạo version mới (copy thành `DRAFT`). Mỗi mã tối đa 1 bản `DRAFT`, nhiều version `ACTIVE` song song được (Action bên core trỏ tới `operation.id` cụ thể). Số version mới = lớn nhất (kể cả bản đã xoá) + 1. Chỉ activate được khi system và connection đang `ACTIVE`.
- **Secret** theo `authType` (`authConfig` chứa phần không bí mật, `secret` chỉ ghi):

  | authType | `authConfig` | `secret` |
  |---|---|---|
  | `NONE` | — | — |
  | `API_KEY` | `headerName` | `apiKey` |
  | `BASIC` | `username` | `password` |
  | `BEARER` | — | `token` |
  | `OAUTH2_CLIENT_CREDENTIALS` | `tokenUrl`, `clientId`, `scope?` | `clientSecret` |

  Sửa connection không gửi `secret` thì giữ secret cũ (bắt buộc gửi khi đổi `authType`); đổi sang `NONE` thì xoá secret.
- **Input / output của API**: tách phần *định nghĩa* (màn thiết kế Flow dùng để map với biến quy trình) và phần *biến đổi* (runtime dùng khi gọi API):

  | | Định nghĩa (màn Flow) | Biến đổi (runtime) |
  |---|---|---|
  | Vào | `inputParams`: các tham số API cần | `requestMapping`: JSONata **chỉ dựng body** từ `$input` |
  | Ra | `outputParams`: các giá trị API trả cho Flow | `responseMapping`: JSONata dựng object output (key = `outputParams.name`) từ `$response` |

  - `inputParams[]`: `name` (`^[A-Za-z_][A-Za-z0-9_]*$`, duy nhất), `label`, `type` (`STRING` / `NUMBER` / `BOOLEAN` / `DATE` / `OBJECT` / `ARRAY`), `required`, `defaultValue`, `description`. `outputParams[]`: `name`, `label`, `type`, `description`. Tối đa 100 phần tử mỗi danh sách.
  - `path`, giá trị của `headers` và `queryParams` dùng tham số qua `{name}`, VD `/tickets/{ticketId}`, `"X-Channel": "{channel}"`. Biến trên `path` phải là tham số bắt buộc đã khai báo (kiểm tra khi lưu).
  - `requestMapping` trống: `GET` / `DELETE` không có body; `POST` / `PUT` / `PATCH` gửi object gồm các tham số không dùng ở path / headers / queryParams.
  - `responseMapping` trống: mỗi giá trị đầu ra lấy field cùng tên ở cấp đầu của response body.
  - Header khi gọi: `headers` của API (đã thay `{name}`), sau đó header xác thực của connection gắn sau cùng, không ghi đè được.
  - Phần gọi API thật (runtime) làm ở giai đoạn sau.
- **Cấu hình dạng JSON** (lưu cột LONGTEXT) có DTO riêng, kiểm tra bằng annotation (`@Min`, `@Max`, `@Size`...), lỗi trả theo từng field (mã 1000 kèm danh sách field):

  | Field | DTO | Ghi chú |
  |---|---|---|
  | connection `authConfig` | `AuthConfigData` (`headerName`, `username`, `tokenUrl`, `clientId`, `scope`) | Field bắt buộc theo `authType` |
  | connection `secret` | `SecretData` (`apiKey`, `password`, `token`, `clientSecret`) | Chỉ ghi, mã hoá |
  | connection `circuitBreakerConfig` | `CircuitBreakerConfigData` | Tỉ lệ 1–100, các giá trị khác > 0 |
  | operation `retryPolicy` | `RetryPolicyData` (`maxAttempts` 1–10, `backoffMs` ≥ 0, `backoffMultiplier` 1–10, `retryOnStatus` 400–599, `retryOnTimeout`) | |
  | operation `inputParams` / `outputParams` | `OperationInputParam` / `OperationOutputParam` | |
  | operation `headers` / `queryParams` | `Map<String, String>` | Key tự do |
  | operation `requestSchema` / `responseSchema` | JSON tự do | Tài liệu mô tả payload, chưa kiểm tra |

  Key lạ trong JSON bị bỏ qua (không lưu).
- **Test kết nối** chỉ kiểm tra DNS → TCP → TLS (https) → HTTP (`HEAD`, 405/501 thì `GET`; nhận bất kỳ status nào là máy chủ đang chạy). Không gọi API nghiệp vụ, không dùng secret, không theo redirect, timeout tối đa 10 giây. Luôn trả HTTP 200 kèm `success`, `stage`, `errorCode`, `httpStatus`, `durationMs`, `message`.

## API

Prefix `/api/v1/integrations`. Danh sách phân trang (`page` từ 1, `size` mặc định 20, tối đa 100), sắp xếp `updatedAt` giảm dần. Sửa / đổi trạng thái nhận `rowVersion` (lệch thì 409).

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/v1/health-check` | Public, trạng thái db, redis... |
| GET | `/systems` | Lọc `keyword` (mã/tên), `status`, `environment`; kèm `connectionCount` |
| GET | `/systems/{id}` | Chi tiết |
| POST | `/systems` | Tạo |
| PUT | `/systems/{id}` | Sửa (không sửa mã) |
| DELETE | `/systems/{id}` | Xoá mềm, chặn khi còn connection |
| GET | `/connections` | Lọc `systemId`, `keyword`, `status`, `protocol`, `authType`; kèm hệ thống và `operationCount` |
| GET | `/connections/{id}` | Chi tiết (có `hasSecret`, `secretUpdatedAt`, không có secret) |
| POST | `/connections` | Tạo, kèm `secret` |
| PUT | `/connections/{id}` | Sửa (không sửa hệ thống, mã) |
| DELETE | `/connections/{id}` | Xoá mềm + xoá secret, chặn khi còn API |
| POST | `/connections/{id}/test` | Test kết nối của connection đã lưu |
| POST | `/connections/test` | Test kết nối trên form chưa lưu: `baseUrl`, `timeoutMs?` |
| GET | `/operations` | Lọc `keyword` (mã/tên), `systemId`, `connectionId`, `status`, `httpMethod` |
| GET | `/operations/active` | Không phân trang: API dùng được trong Flow, lọc `keyword`, `systemId` |
| GET | `/operations/{id}` | Chi tiết (tham số đầu vào / đầu ra, schema, mapping, retry...) |
| GET | `/operations/{id}/versions` | Các version của cùng mã, mới nhất trước |
| POST | `/operations` | Tạo bản nháp version 1 |
| PUT | `/operations/{id}` | Sửa bản nháp |
| POST | `/operations/{id}/new-version` | Tạo bản nháp version mới từ một version |
| POST | `/operations/{id}/activate` | `DRAFT` / `INACTIVE` → `ACTIVE` |
| POST | `/operations/{id}/deactivate` | `ACTIVE` → `INACTIVE` |
| DELETE | `/operations/{id}` | Xoá mềm bản nháp |
