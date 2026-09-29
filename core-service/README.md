# core-service

Service điều phối của ProcessX (Flow System – IPCC 2.0): xác thực người dùng qua Keycloak và quản lý quy trình canvas (ticket call flow).

**Công nghệ:** Java 17, Spring Boot 3.3, MariaDB, Redis, Keycloak.

## Chạy local

```bash
cp .env.example .env
./mvnw spring-boot:run
```

- API: `http://localhost:8080/api/v1/...`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8081/actuator/health`

Script tạo DB nằm trong [`src/main/resources/db/`](src/main/resources/db).
