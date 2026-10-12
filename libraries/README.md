# libraries

Thư mục dành cho các thư viện dùng chung của backend Ticket Flow.

Các module hiện có:

- `common-parent`: Maven parent quản lý version dependency và plugin; được publish/install độc lập.
- `common-core`: API response, exception (`BaseErrorCode`, `AppException`, `BaseExceptionHandler`), i18n và request ID dùng chung.
- `common-auth`: authentication token, API-key/Keycloak filter và security-context utility dùng chung.

## Phạm vi dự kiến

- `ApiResponse` (`code`, `message`, `result`, `requestId`) và `ErrorCode` nền tảng (1xxx)
- Exception + global exception handler, i18n (`Translator`, locale resolver – vi mặc định, en)
- Tích hợp Keycloak: validate token (introspection), `SecurityContextUtils`, API key filter
- Request ID / logging filter, các utils dùng chung
- DTO/event dùng chung giữa các service (Kafka message, ...)

## Xử lý lỗi

- Thư viện chỉ giữ lỗi nền tảng mà chính nó phát sinh: `ErrorCode` (1xxx) – xác thực, phân quyền, validate, 404/405,
  conflict, Redis, lỗi không xác định. Filter của common-auth trả các lỗi này trước khi request vào controller.
- Mỗi service tự khai báo mã lỗi nghiệp vụ: enum `XxxErrorCode implements BaseErrorCode`, key `err.code.<TÊN_MÃ>` trong i18n của service.
- Message của lỗi nền tảng và `response.success` nằm trong common-core: `i18n/common-messages*.properties`.
  Service khai báo `spring.messages.basename=i18n/messages,i18n/common-messages`; file của service đứng trước
  nên muốn đổi câu của lỗi chung thì khai báo lại key đó trong `i18n/messages*.properties` của service.
- Chỉ có một exception `AppException` (nhận mọi `BaseErrorCode`) và một bộ xử lý chung `BaseExceptionHandler`.
  Mỗi service tạo `@RestControllerAdvice class XxxExceptionHandler extends BaseExceptionHandler`, chỉ thêm / override case riêng
  (override thì khai báo lại `@ExceptionHandler`). Service chưa có handler riêng thì dùng `DefaultExceptionHandler`.

| Dải mã | Nơi khai báo |
|---|---|
| 1xxx, 9999 | `common-core` – `ErrorCode` |
| 2xxx | `core-service` – `CoreErrorCode` |
| 3xxx | `integration-service` – `IntegrationErrorCode` |
| 4xxx | `engine-service` (dự kiến) |
| 5xxx | `report-service` (dự kiến) |

Không chuyển business logic, Flowable configuration, entity hoặc repository riêng của service vào đây.
