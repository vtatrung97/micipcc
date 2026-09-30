# Ticket Flow

Monorepo chứa toàn bộ source của Ticket Flow. Mỗi service nằm trong một thư mục riêng, có README và cách build/chạy riêng.

## Cấu trúc

| Thư mục | Loại | Mô tả |
|---|---|---|
| [`libraries`](libraries) | BE – thư viện | Khu vực dành cho các thư viện dùng chung của backend |
| [`libraries/common-parent`](libraries/common-parent) | Maven parent | Quản lý version dependency/plugin, được publish độc lập |
| [`libraries/common-auth`](libraries/common-auth) | BE – thư viện | Thành phần xác thực dùng chung cho các backend service |
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

Các thư viện được build và cài vào Maven local theo thứ tự dependency, sau đó service sử dụng chúng như artifact thông thường:

```bash
cd core-service
./mvnw -f ../libraries/common-parent/pom.xml clean install
./mvnw -f ../libraries/common-core/pom.xml clean install
./mvnw -f ../libraries/common-auth/pom.xml clean install
./mvnw clean package
cd ../engine-service
./mvnw clean package
```

Trong CI/CD, thay bước cài local bằng publish `common-parent`, `common-core` và `common-auth` lên Maven repository trước khi build service.

```bash
cd core-service && ./mvnw clean package
cd ../engine-service && ./mvnw clean package
```
