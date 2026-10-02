# core-service

Service điều phối của Ticket Flow: xác thực người dùng qua Keycloak và quản lý quy trình canvas (ticket call flow).

**Công nghệ:** Java 17, Spring Boot 3.5.4, MariaDB, Redis, Keycloak.

## Chạy local

```bash
cp .env.example .env
./mvnw spring-boot:run
```

- API: `http://localhost:8080/api/v1/...`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

Kết nối Redis và Spring Cache được cấu hình dùng chung từ `libraries/common-core`. Cache mặc định bật với TTL
10 phút; có thể thay đổi bằng `CACHE_ENABLED` và `CACHE_DEFAULT_TTL`.

Script tạo DB nằm trong [`src/main/resources/db/`](src/main/resources/db).


## Before Run 
mvn -f libraries/common-parent/pom.xml clean install
mvn -f libraries/common-core/pom.xml clean install
mvn -f libraries/common-auth/pom.xml clean install
mvn -f core-service/pom.xml clean package -DskipTests