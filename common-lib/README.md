# common-lib

Thư viện dùng chung cho toàn bộ service BE của ProcessX (Flow System – IPCC 2.0). Không chạy độc lập — được build thành JAR và các service (`core-service`, `engine-service`, `integration-service`, `report-service`) import qua Maven.

**Công nghệ:** Java 17, Spring Boot 3.3 (auto-configuration).

## Phạm vi dự kiến

- `ApiResponse` (`code`, `message`, `result`, `requestId`) và `ErrorCode` chung
- Exception + global exception handler, i18n (`Translator`, locale resolver – vi mặc định, en)
- Tích hợp Keycloak: validate token (introspection), `SecurityContextUtils`, API key filter
- Request ID / logging filter, các utils dùng chung
- DTO/event dùng chung giữa các service (Kafka message, ...)

## Sử dụng (dự kiến)

```xml
<dependency>
    <groupId>com.lifesup.processx</groupId>
    <artifactId>common-lib</artifactId>
    <version>${processx-common.version}</version>
</dependency>
```

Build & cài vào local repo:

```bash
./mvnw clean install
```

> Trạng thái: chưa khởi tạo code. Các phần chung hiện đang nằm trong `core-service` sẽ được tách dần sang đây.
