# libraries

Thư mục dành cho các thư viện dùng chung của backend Ticket Flow.

Hiện chưa có Maven module hoặc source code. Chỉ thêm module khi xuất hiện hợp đồng hoặc tiện ích thực sự được nhiều service tái sử dụng.

## Phạm vi dự kiến

- `ApiResponse` (`code`, `message`, `result`, `requestId`) và `ErrorCode` chung
- Exception + global exception handler, i18n (`Translator`, locale resolver – vi mặc định, en)
- Tích hợp Keycloak: validate token (introspection), `SecurityContextUtils`, API key filter
- Request ID / logging filter, các utils dùng chung
- DTO/event dùng chung giữa các service (Kafka message, ...)

Không chuyển business logic, Flowable configuration, entity hoặc repository riêng của service vào đây.
