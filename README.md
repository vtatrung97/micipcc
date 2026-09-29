# ProcessX – Flow System (IPCC 2.0)

Monorepo chứa toàn bộ source của ProcessX. Mỗi service nằm trong một thư mục riêng, có README và cách build/chạy riêng.

## Cấu trúc

| Thư mục | Loại | Mô tả |
|---|---|---|
| [`common-lib`](common-lib) | BE – thư viện | Code dùng chung cho các service BE, build thành JAR để import |
| [`core-service`](core-service) | BE – service | Điều phối: xác thực (Keycloak), quản lý quy trình canvas |
| [`engine-service`](engine-service) | BE – service | Thực thi quy trình BPMN/DMN trên Flowable |
| [`integration-service`](integration-service) | BE – service | Tích hợp hệ thống ngoài, gửi thông báo |
| [`report-service`](report-service) | BE – service | Báo cáo, audit log |
| [`web-app`](web-app) | FE | Giao diện web (Angular) |

## Công nghệ chung

- BE: Java 17, Spring Boot 3.3, Maven
- FE: Angular
- Hạ tầng: MariaDB (Galera + MaxScale), Keycloak (dùng chung IPCC 2.0), Kafka, Redis, MinIO, Kong, Kubernetes

## Build

`common-lib` phải được build/cài trước khi build các service BE:

```bash
cd common-lib && ./mvnw clean install
cd ../core-service && ./mvnw clean package
```
