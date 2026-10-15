# CLAUDE.md — core-service (ProcessX / Flow System – IPCC 2.0)

File hướng dẫn cho Claude Code. **Không commit** (đã có trong `.gitignore`).

## Bối cảnh dự án

- Flow System (ProcessX): nền tảng điều phối quy trình BPMN cho IPCC 2.0. Lifesup làm cho VCX (Viettel).
- Tài liệu gốc ở thư mục cha `Ticket_flow/`: BRD (WS01), WS02 User Story/FR/NFR, Architecture_Design (WS04), `KH triển khai.xlsx`.
- Kiến trúc WS04: 4 service BE (`core-service`, `engine` (Flowable BPMN + DMN), `integration-service` (+thông báo),
  `report-service` (+audit)) và FE Angular `webapps`. Hạ tầng dùng chung IPCC 2.0: Keycloak, Kong, Kafka, Redis, MinIO, MariaDB.
- `core-service` = service điều phối: Template/Canvas, Flow Instance, Task, cấu hình, phân quyền.
- Ràng buộc: **MariaDB bắt buộc**, Keycloak dùng chung IPCC 2.0 (ProcessX chỉ đọc), HA trên k8s, không tích hợp thẳng BCCS.

## Công nghệ

- **Java 17** (bắt buộc). JDK: `C:\Program Files\Java\jdk-17` — khi chạy `mvnw` đặt `JAVA_HOME` về JDK này.
- Spring Boot 3.3.5, Maven wrapper (`./mvnw`), Lombok.
- MariaDB (JPA/Hibernate, `ddl-auto: validate`), Redis (Lettuce, standalone/Sentinel), Actuator + Prometheus, springdoc.
- Xác thực Keycloak qua thư viện `libraries/common-auth` (JWT resource server, RPT).
- Không dùng: Liquibase, MapStruct.

## Rule bắt buộc

### Chung
- **Không viết JUnit/test** trừ khi được yêu cầu.
- Trả lời, comment, message lỗi, tài liệu: **tiếng Việt**.
- Code theo phong cách meloscan-backend (`E:\NguyenQuangHa\VBA\Melo\meloscan-backend`): Lombok
  `@RequiredArgsConstructor` + `@FieldDefaults(level = PRIVATE, makeFinal = true)`, DTO `@Data @Builder`,
  `ApiResponse`, `CoreErrorCode` + `AppException`, service dạng **interface + impl**.
- Không log dữ liệu nhạy cảm (mật khẩu, token, API key). Không dùng aspect log toàn bộ tham số.

### Response & lỗi
- Mọi API trả `ApiResponse { code, message, result, requestId }`. Thành công: `code = 200`.
- Lỗi nghiệp vụ của core-service: khai báo trong `common/exception/CoreErrorCode` (mã số + HTTP status, implement `BaseErrorCode`),
  key message `err.code.<TÊN_MÃ>`, nội dung trong i18n. Lỗi nền tảng (xác thực, validate, 404, conflict...) là `ErrorCode` của common-core.
  Ném `new AppException(CoreErrorCode.X)`, `AppException.withArgs(CoreErrorCode.X, args...)` khi message có {0},
  hoặc `new AppException(CoreErrorCode.X, "key i18n khác / câu cụ thể")` để thay message.
- `CoreExceptionHandler extends BaseExceptionHandler` (common-core) dịch message và trả `ApiResponse`;
  case lỗi riêng của core-service thêm / override trong `CoreExceptionHandler`.
- Dải mã: `1xxx` chung (common-core), `2xxx` core-service, `3xxx` integration-service (xem libraries/README.md).

### Đa ngôn ngữ
- Theo header `Accept-Language`, hỗ trợ `vi`, `en`. **Không truyền / sai định dạng / không hỗ trợ → `vi`.**
- Message: `src/main/resources/i18n/messages.properties` (vi, mặc định) và `messages_en.properties` — luôn thêm cả 2.
- Validation dùng key: `@NotBlank(message = "{validation.<module>.<field>.required}")`.

### Xác thực (package `security`)
- Xác thực luôn bật (common-auth, `ticket-flow.auth.enabled` mặc định `true`); login/refresh/logout Keycloak do common-auth xử lý, core-service không có API `/api/v1/auth`.
- 2 cách:
  1. `X-API-Key` — service nội bộ gọi nhau. `INTERNAL_API_KEYS=serviceName:key,...` (key ≥ 32 ký tự) **dùng chung mọi service**:
     gọi sang service X thì gửi key của X (inject `InternalApiKeys`, `get("X")`); service chỉ nhận key mang tên mình
     (`spring.application.name`) → `ROLE_SERVICE`, principal `internal`, bỏ qua `@CheckScopePermission`/`@CheckPermission`.
  2. `Authorization: Bearer <token>` — env Keycloak **chỉ có** `KEYCLOAK_AUTH_SERVER_URL`.
     Giống IPCC `PathBasedConfigResolver`: mọi cấu hình Keycloak (realm, resource, secret, policy-enforcer paths) đọc từ MinIO
     `keycloak-adapter-config-os/core-service.json` (env `MINIO_BASE_URL/ACCESS_KEY/SECRET_KEY`, cổng S3 API), đọc 1 lần rồi cache.
     Env chỉ ghi đè `auth-server-url`.
     common-auth kiểm chữ ký qua JWKS + issuer của realm, không kiểm `aud`, rồi policy enforcer kiểm quyền resource/scope.
     **Không lưu/blacklist token trong Redis.**
- Lấy người dùng trong code: `SecurityContextUtils.getAccessToken()`, `getUserId()`, `getUsername()`, `getTokenString()`.
- Quyền: realm role → `ROLE_<role>`; client role của client `resource` trong file config Keycloak giữ nguyên (VD `template:view`).
- API public mới: thêm vào `SecurityConfig.PUBLIC_ENDPOINTS`.
- Phân quyền API (Keycloak Authorization Services, client `ticket-flow`): **một resource `core-api` URI `/api/v1/*`** cho cả service,
  mỗi API gắn `@CheckScopePermission(scope = PermissionScope.XXX)`. Scope dạng `<chức năng>:<hành động>`
  (VD `ticket-call-flow:view`), khai báo trong `common/constant/PermissionScope`. API mới không cần resource mới; chức năng
  mới thì thêm scope ở `PermissionScope` + tạo scope cùng tên trên Keycloak, gắn vào resource `core-api` và permission.

### Database (theo Architecture Design v1.1 mục 2.1)
- **Flyway** quản lý DB, app tự chạy khi khởi động (trước JPA `validate`). Script ở `src/main/resources/db/`:
  - `table_setup/`: cấu trúc bảng (CREATE / ALTER).
  - `data_setup/`: dữ liệu master (insert dạng `WHERE NOT EXISTS`), **không đưa dữ liệu test/mẫu vào**.
  - Tên file `V<n>__yyyymmdd_hhmmss_<y_nghia>.sql` (VD `V2__20261005_093000_create_task.sql`): `n` tăng dần,
    **không trùng trên cả 2 thư mục** (Flyway chạy theo `n`), phần sau `__` là thời điểm viết + ý nghĩa.
  - File đã chạy lên môi trường nào thì **không sửa nội dung / đổi tên nữa**, thay đổi tiếp theo viết file mới.
- `db/database_setup.sql`: DevOps chạy một lần bằng tài khoản quản trị để tạo DB + user (không tạo bảng).
- Mỗi service 1 DB + 1 user trùng tên, **mật khẩu `<tênDB>#123`** (VD `core_service` / `core_service#123`).
  User có quyền DML + DDL trên schema của mình (Flyway chạy bằng user này); tách user migration → `FLYWAY_USERNAME/PASSWORD`.
- Trong `.env`, giá trị có `#` hoặc khoảng trắng **phải đặt trong nháy kép** (IntelliJ coi `#` là comment).
- Bảng: `utf8mb4 / utf8mb4_unicode_ci`.
- Tên bảng theo nghiệp vụ, không tiền tố, snake_case chữ thường (Architecture Design mục 2.5: `template`, `task`, `action`, `user_account`...).
  Entity đặt theo tên bảng: `template` → `TemplateEntity`.
- **Khoá chính `BIGINT` TSID** sinh ở app: `@Id @Tsid Long id` (hypersistence-utils), không `AUTO_INCREMENT`.
  Id trả ra API **dạng chuỗi** (`@JsonSerialize(using = ToStringSerializer.class)` + `@Schema(type = "string")`)
  vì TSID vượt `Number.MAX_SAFE_INTEGER` của JavaScript.
- **Thời gian lưu `BIGINT` epoch millis** (không dùng `DATETIME`), entity/DTO/request kiểu `Long`, API nhận và trả số millis (VD `1790848611765`). Lấy giờ hiện tại: `System.currentTimeMillis()`.
- Cột chuẩn: `tenant_id`, `realm`, `group_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `row_version`
  (kế thừa `BaseEntity`: `created_*`, `updated_*`, `row_version`).
  - `tenant_id VARCHAR(100) NULL` — theo tài liệu kiến trúc, chưa chốt nguồn giá trị.
  - `realm VARCHAR(100) NULL` — realm Keycloak của người tạo (lấy từ issuer của token).
  - `group_id VARCHAR(36) NULL` — id group Keycloak của người tạo (lấy từ token).
  - BE tự gán khi tạo bản ghi; **FE không truyền**, không đổi khi cập nhật. Không có token → `NULL`.
  - Hiện **chỉ lưu, chưa lọc** truy vấn theo 3 cột này, entity chưa map (trừ `user_account.realm/group_id` là dữ liệu của user).
- Bảng cấu hình xoá mềm bằng cột `deleted`; mã duy nhất trong bản ghi chưa xoá dùng cột ảo
  `active_code AS (IF(deleted = 0, code, NULL)) PERSISTENT` + UNIQUE.
- Chống lưu đè: `@Version row_version`, client gửi `rowVersion` khi cập nhật, lệch → 409 `DATA_CONFLICT`.
- Danh sách không trả cột lớn (VD `model_json`): dùng JPQL constructor projection ra DTO tóm tắt.

### Môi trường local
- MariaDB `localhost:3307` (root/`123`), Redis `localhost:6379`. Client: `C:/Program Files/MariaDB 13.0/bin/mariadb.exe` (chưa có trong PATH). Restore dump: `Ticket_flow/DB/dump_db.cmd`.
- **Trước khi ALTER/DELETE trên DB local phải kiểm tra dữ liệu hiện có** (người dùng tự chạy SQL giữa các lượt).
  Dọn dữ liệu test: chỉ xoá đúng bản ghi mình tạo, **không `DELETE FROM <bảng>` toàn bộ**.
- Swagger: http://localhost:8080/swagger-ui.html — Actuator: http://localhost:8080/actuator/health
- CORS: `CORS_ALLOWED_ORIGINS="http://localhost:4200,http://192.168.10.18:4200"` (nhiều domain, phân cách dấu phẩy).

## Cấu trúc code

```
core-service/
├── CLAUDE.md                      # file này (không commit)
├── README.md                      # hướng dẫn chạy, API, cấu hình
├── .env / .env.example            # biến môi trường (.env không commit)
├── Dockerfile                     # temurin 17, non-root, cổng 8080 (API + actuator)
├── pom.xml
└── src/main/
    ├── java/com/lifesup/processx/core/
    │   ├── CoreServiceApplication.java
    │   ├── common/enums/          # enum nghiệp vụ (TicketCallFlowStatus)
    │   ├── configuration/         # cấu hình + hạ tầng web
    │   │   ├── AppProperties(+Config)        # prefix app.* (api-key, i18n, redis, cors)
    │   │   ├── RedisConfig, JpaConfig (auditing), OpenApiConfig, LocaleConfig
    │   │   ├── HeaderLocaleResolver, Translator (i18n), RequestIdFilter (X-Request-Id)
    │   │   └── StringTrimDeserializer
    │   ├── controller/            # REST controller, prefix /api/v1
    │   ├── dto/request/           # request DTO (validation)
    │   ├── dto/response/          # ApiResponse, PageResponse, response DTO, DTO Keycloak
    │   ├── entity/                # BaseEntity + entity JPA
    │   ├── common/exception/      # CoreErrorCode (2xxx), CoreExceptionHandler
    │   ├── repository/            # Spring Data JPA
    │   ├── security/              # SecurityConfig (luồng + PUBLIC_ENDPOINTS + CORS),
    │   │                          # ApiKeyAuthenticationFilter, KeycloakAuthenticationFilter (kèm token lồng bên trong)
    │   ├── service/               # interface
    │   │   └── impl/              # triển khai
    │   └── utils/                 # SecurityContextUtils
    └── resources/
        ├── application.yaml       # mọi giá trị lấy từ biến môi trường
        ├── db/database_setup.sql  # tạo DB + user (DevOps chạy 1 lần)
        ├── db/table_setup/       # Flyway: cấu trúc bảng, V<n>__yyyymmdd_hhmmss_<y_nghia>.sql
        ├── db/data_setup/        # Flyway: dữ liệu master, cùng quy tắc đặt tên
        └── i18n/messages*.properties
```

### Thêm một module mới (VD `xxx`)
1. Migration mới `db/table_setup/V<n>__yyyymmdd_hhmmss_create_xxx.sql`: `CREATE TABLE xxx` (PK `BIGINT` TSID, cột chuẩn `tenant_id` + `realm` + `group_id`, thời gian `BIGINT` epoch millis, `deleted` nếu là cấu hình).
2. `entity/XxxEntity extends BaseEntity` (`@Id @Tsid Long id`) → `repository/XxxRepository`.
3. `dto/request/XxxCreateRequest`, `XxxUpdateRequest`; `dto/response/XxxResponse` (+ `XxxSummaryResponse` nếu có danh sách).
4. `service/XxxService` + `service/impl/XxxServiceImpl` (`@Transactional`, ném `AppException`).
5. `controller/XxxController` `@RequestMapping("/api/v1/xxx")`, trả `ApiResponse`, chỉ `@Tag` ở class, không `@Operation`/`@Parameter`/comment trên method.
6. Mã lỗi mới trong `CoreErrorCode` (dải 2xxx) + message vi/en.

## API hiện có

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/v1/health-check` | trạng thái db, redis... |
| GET/POST | `/api/v1/ticket-call-flows` | danh sách (keyword, name, code, status, hasDraft, publishedVersionNo, updatedFrom/To, publishedFrom/To epoch millis tính cả hai đầu, sortBy = field của response + sortDir asc/desc, page từ 1, size ≤ 100) / tạo |
| GET | `/api/v1/ticket-call-flows/stats` | tổng số, đang hiệu lực (ACTIVE), có bản nháp |
| GET/PUT/DELETE | `/api/v1/ticket-call-flows/{id}` | chi tiết / lưu lại vào bản nháp (kèm `rowVersion`) / xoá mềm |
| POST | `/api/v1/ticket-call-flows/{id}/clone` | nhân bản: mã/tên mới, sao chép `flowJson` mới nhất, trạng thái DRAFT |
| POST | `/api/v1/ticket-call-flows/{id}/publish`, `/discard-draft` | publish bản nháp / huỷ bản nháp (body tuỳ chọn `{rowVersion}`) |
| GET | `/api/v1/ticket-call-flows/{id}/versions`, `/versions/{versionNo}` | lịch sử phiên bản / chi tiết một phiên bản kèm `flowJson` |

Bảng (theo Architecture Design mục 2.5): `template` (TemplateEntity) giữ thông tin chung, `template_version` (TemplateVersionEntity) giữ canvas ở `model_json`;
`user_account` (UserAccountEntity) là bản sao đọc người dùng Keycloak. API vẫn giữ tên `ticket-call-flows` và field `flowJson`.
- Mỗi quy trình tối đa 1 bản `DRAFT` + 1 bản `PUBLISHED` (unique trên cột ảo), bản hiệu lực cũ → `ARCHIVED`.
- Tạo mới = v1 DRAFT. PUT ghi vào bản nháp, chưa có thì tạo bản nháp `max(version_no) + 1`.
- Publish lần đầu: quy trình `DRAFT → ACTIVE`. Sau đó `status` chỉ chuyển ACTIVE ↔ INACTIVE (khác → 2008).
- Mọi thao tác ghi tăng `template.row_version` (kể cả chỉ sửa canvas) → FE chỉ cần một `rowVersion`.
- `versionName` / `versionDescription` (tuỳ chọn) gán qua PUT (vào bản nháp) hoặc publish: null = giữ nguyên, "" = xoá.

`caseCodePrefix` (tiền tố mã hồ sơ, VD `PAKN` → `PAKN-2026-00001`): bắt buộc khi tạo/nhân bản, `^[A-Z0-9]+$` ≤ 20,
không đổi sau khi tạo, duy nhất trong quy trình chưa xoá (2009). Keyword danh sách tìm cả tiền tố.

Loại kích hoạt + SLA + `category` lưu ở `template` (V2). Request/response: `trigger { type MANUAL|AUTO|SCHEDULE|HYBRID,
inputFormId, apiId, scheduleType ONCE|REPEAT, runDate, runTime (giờ VN), repeat DAILY }`, `slaValue` + `slaUnit MINUTE|HOUR|DAY`.
Tạo mới bắt buộc; PUT không truyền = giữ nguyên. Kiểm field theo loại ở `applyTrigger` (2010), SLA thiếu một nửa → 2011.

`flowJson`: **String** ở cả request và response, BE lưu và trả nguyên văn (chỉ kiểm cú pháp JSON + ≤ 5 MB).
Bước đọc JSON canvas → BPMN/Flowable làm sau.
