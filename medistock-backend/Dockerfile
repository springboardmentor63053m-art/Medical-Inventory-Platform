# =========================================================
# Standalone Backend Dockerfile for Spring Boot 3 on Render
# =========================================================

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

# Dynamically bind server port to Render's PORT environment variable
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
