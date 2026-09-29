FROM eclipse-temurin:17-jdk AS build
WORKDIR /build

COPY .mvn/ ./.mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Chạy non-root (WS04 mục 10)
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /build/target/*.jar app.jar
USER app

# 8080: API, 8081: actuator (probe, metrics)
EXPOSE 8080 8081
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
