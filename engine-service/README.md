# engine-service

Service thực thi BPMN/DMN của Ticket Flow bằng Flowable. Business/orchestration logic thuộc `core-service`; service này chỉ sở hữu runtime và các bảng `ACT_*` của Flowable.

## Công nghệ

- Java 17
- Spring Boot 3.5.4
- Flowable 7.2.0
- MariaDB

## Chuẩn bị MariaDB local

```sql
CREATE DATABASE flow_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'flow_engine'@'%' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON flow_engine.* TO 'flow_engine'@'%';
FLUSH PRIVILEGES;
```

Sao chép `.env.example` thành `.env`, sau đó đưa các biến vào môi trường chạy của shell hoặc IDE. Không commit `.env`.

## Build và chạy

```bash
./mvnw clean test
./mvnw spring-boot:run
```

- API port: `8000`
- Actuator: `http://localhost:8001/actuator/health`

`FLOWABLE_DATABASE_SCHEMA_UPDATE=true` chỉ dành cho local development. Production phải kiểm soát giá trị này trong cấu hình triển khai.

POC tự động deploy một BPMN User Task và một DMN decision. Integration test dùng H2 ở test scope để kiểm tra BPMN lifecycle, history và DMN evaluation; runtime dùng MariaDB.
