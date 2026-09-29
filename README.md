# Ticket Flow

Monorepo chứa toàn bộ source của Ticket Flow. Mỗi service nằm trong một thư mục riêng, có README và cách build/chạy riêng.

## Cấu trúc

| Thư mục | Loại | Mô tả |
|---|---|---|
| [`libraries`](libraries) | BE – thư viện | Khu vực dành cho các thư viện dùng chung của backend |
| [`core-service`](core-service) | BE – service | Điều phối: xác thực (Keycloak), quản lý quy trình canvas |
| [`engine-service`](engine-service) | BE – service | Thực thi quy trình BPMN/DMN trên Flowable |
| [`integration-service`](integration-service) | BE – service | Tích hợp hệ thống ngoài, gửi thông báo |
| [`report-service`](report-service) | BE – service | Báo cáo, audit log |
| [`web-app`](web-app) | FE | Giao diện web (Angular) |

## Công nghệ chung

- BE: Java 17, Spring Boot 3.5.4, Maven
- FE: Angular
- Hạ tầng: MariaDB (Galera + MaxScale), Keycloak, Kafka, Redis, MinIO, Kong, Kubernetes

## Build

Mỗi service được build độc lập:

```bash
cd core-service && ./mvnw clean package
cd ../engine-service && ./mvnw clean package
```
