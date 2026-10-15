# engine-service

Service thực thi quy trình của Ticket Flow trên Flowable: chuyển flowJson của Canvas thành BPMN, deploy, chạy phiên
quy trình và xử lý task. Business / orchestration (template, phiên bản, phân quyền người dùng) thuộc `core-service`;
service này chỉ sở hữu runtime và các bảng `ACT_*` của Flowable.

## Công nghệ

- Java 17, Spring Boot 3.5.4, Flowable 7.2.0, MariaDB
- `libraries/common-core` (ApiResponse, mã lỗi, i18n), `libraries/common-auth` (X-API-Key / Keycloak)

## Chạy local

```sql
CREATE DATABASE engine_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'engine_service'@'%' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON engine_service.* TO 'engine_service'@'%';
FLUSH PRIVILEGES;
```

Sao chép `.env.example` thành `.env` và đưa biến vào môi trường chạy. Cài thư viện dùng chung trước (xem README gốc).

```bash
./mvnw clean test
./mvnw spring-boot:run
```

- API: `http://localhost:8000/internal/v1/...`, Swagger: `http://localhost:8000/swagger-ui.html`
- Actuator: `http://localhost:8001/actuator/health`
- `FLOWABLE_DATABASE_SCHEMA_UPDATE=true` chỉ dùng ở local.
- Khi integration-service chưa có API execute / gửi thông báo: `INTEGRATION_MODE=stub`.

## Luồng xử lý

```
core ──flowJson──► parse ─► map (cấu hình strict) ─► validate ─► BpmnModel ─► validator Flowable ─► deploy
core ──input────► START (map biến) ─► ... node ... ─► END (__output) ──► core / quy trình cha
```

## Cấu trúc code

```
engine/
  controller/ service/ dto/          API nội bộ cho core-service
  client/                            gọi integration-service (http / stub)
  exception/                         mã lỗi 4xxx, exception handler
  workflow/                          lõi: NodeHandler (SPI), NodeHandlers, mapper, WorkflowConverter, NodeConfigReader
    validation/                      quy tắc xét cả đồ thị (id, edge, START / END, đi tới được), mã lỗi
    bpmn/                            dựng BpmnModel, phần mở rộng tf:*
  node/                              mỗi loại node một package: cấu hình + handler + bean runtime
    start/ end/ gateway/ (gồm JOIN) usertask/ systemtask/ notification/ subprocess/
```

Mỗi package `node/<loại>` gồm:
- `<Loại>NodeConfig`: cấu hình FE gửi (class lồng cho mapping, enum dùng riêng).
- `<Loại>NodeHandler` (`extends NodeHandler`): cổng ra hợp lệ, khai báo / kiểm tra biến và cấu hình, sinh BPMN.
- Bean runtime (listener / delegate) nếu node cần chạy code; hằng `BEAN` là tên đã ghi vào BPMN đã deploy, **không được đổi**.

Thêm loại node mới: thêm giá trị `NodeType`, tạo package `node/<loại>` như trên. Không phải sửa lõi `workflow/`.

Cấu hình đầy đủ của mỗi node được ghi vào BPMN dưới dạng phần mở rộng `tf:config` (JSON). Khi chạy, các bean runtime đọc
lại cấu hình theo id phần tử, nên một bean dùng chung cho mọi quy trình, thêm quy trình mới không phải sửa code.

| Node | BPMN | Runtime |
|---|---|---|
| START | startEvent + execution listener | `StartVariableListener`: biến = `value` cố định → `__input[formField]` → `__input[apiField]` |
| GATEWAY_EXCLUSIVE / INCLUSIVE | gateway; mỗi nhánh là sequence flow có điều kiện; `default` (bắt buộc) là default flow | `ConditionEvaluator` + `ConditionOperators`: EQ, NEQ, GT, GTE, LT, LTE, IN, NOT_IN, CONTAINS; AND / OR |
| nhánh `error` của gateway | service task "Đánh giá điều kiện" trước gateway + boundary error `GATEWAY_ERROR` | `GatewayEvaluationDelegate` |
| GATEWAY_PARALLEL | parallelGateway, mọi nhánh (kể cả `default`) chạy song song; nhánh `error` bị từ chối (INVALID_SOURCE_HANDLE) | – |
| JOIN | gateway cùng loại gateway tách nhánh | – |
| USER_TASK | userTask: candidate users / groups, formKey, category = phòng ban; assignee / dueDate là biểu thức | `UserTaskAssignment`: dueDate theo SLA, AUTO giao ROUND_ROBIN, MANUAL một người thì giao thẳng |
| SYSTEM_TASK | serviceTask async + boundary error `SYSTEM_TASK_ERROR` (khi có nhánh error) | `SystemTaskDelegate` → integration-service |
| NOTIFICATION | serviceTask async | `NotificationDelegate` → integration-service; lỗi nghiệp vụ không chặn quy trình |
| SUB_PROCESS | callActivity gọi process key = mã template con | `SubProcessIo`: vào `__input`, ra `__output[subField]` |
| END | endEvent + execution listener | `EndResultListener`: `__output` theo `results` |

Biến nội bộ có tiền tố `__` (`__input`, `__output`), tên biến người dùng không được bắt đầu bằng `__`.

## API nội bộ (X-API-Key, chỉ service nội bộ gọi)

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/internal/v1/definitions/validate` | Kiểm tra flowJson, trả `{valid, errors[]}` |
| POST | `/internal/v1/definitions/deploy` | Deploy; quy trình sai trả mã 4000 kèm danh sách lỗi |
| POST | `/internal/v1/instances` | Khởi tạo theo phiên bản deploy mới nhất, `input` là dữ liệu form / payload API |
| GET | `/internal/v1/instances/{id}` | Trạng thái, bước đang chạy, biến, kết quả |
| POST | `/internal/v1/instances/{id}/cancel` | Huỷ |
| GET | `/internal/v1/tasks` | Task đang mở theo assignee / candidateUser / candidateGroups / processInstanceId |
| GET | `/internal/v1/tasks/{id}` | Task kèm dữ liệu điền sẵn form |
| POST | `/internal/v1/tasks/{id}/claim` | Nhận việc |
| POST | `/internal/v1/tasks/{id}/complete` | Hoàn thành, `formData` ghi vào biến theo outputs |

Lỗi validate quy trình có dạng `{code, elementId, field, message}`; danh sách mã ở `workflow/validation/ValidationCode`.

## Hợp đồng engine cần từ integration-service

engine gọi kèm `X-API-Key` của integration-service, mỗi lần gọi có `idempotencyKey` (giống nhau giữa các lần thử lại).

| Method | Path | Body → result |
|---|---|---|
| POST | `/internal/v1/operations/{apiId}/execute` | `OperationExecuteRequest` → `{status: SUCCESS / BUSINESS_ERROR, output, errorCode, errorMessage}` |
| POST | `/internal/v1/notifications` | `NotificationSendRequest` → `{accepted, errorMessage}` |

integration-service thực hiện retry / timeout (node gửi kèm `retry`, `timeoutSeconds` để ghi đè). Lỗi kỹ thuật
(không kết nối được, 5xx) do async executor của Flowable thử lại; hết lượt job vào dead letter.

## Giả định đang dùng (chờ FE / BA chốt)

- Nhánh `error` của gateway = lỗi khi đánh giá điều kiện (thiếu dữ liệu, sai kiểu); không nhánh nào khớp thì đi `default`.
- Gateway parallel không có nhánh `error`; nhánh `default` là một nhánh song song bình thường.
- So sánh chuỗi phân biệt hoa thường, sau khi trim; hai bên đều là số thì so theo số.
- Quy trình con chạy phiên bản deploy mới nhất tại thời điểm gọi; vòng lặp giữa các template do core-service chặn khi publish.
- SLA tính theo lịch thường (1 ngày = 24 giờ); `slaUnit` tạm nhận cả nhãn tiếng Việt ("Giờ", "Ngày", "Tuần").
- Engine tin tưởng core-service đã kiểm quyền người dùng trước khi gọi API task.
