# libraries

Thư mục dành cho các thư viện dùng chung của backend Ticket Flow.

Các module hiện có:

- `common-parent`: Maven parent quản lý version dependency và plugin; được publish/install độc lập.
- `common-core`: API response, exception, global exception handler, i18n và request ID dùng chung.
- `common-auth`: authentication token, API-key/Keycloak filter và security-context utility dùng chung.

## Phạm vi dự kiến

- `ApiResponse` (`code`, `message`, `result`, `requestId`) và `ErrorCode` chung
- Exception + global exception handler, i18n (`Translator`, locale resolver – vi mặc định, en)
- Tích hợp Keycloak: validate token (introspection), `SecurityContextUtils`, API key filter
- Request ID / logging filter, các utils dùng chung
- DTO/event dùng chung giữa các service (Kafka message, ...)

Không chuyển business logic, Flowable configuration, entity hoặc repository riêng của service vào đây.
