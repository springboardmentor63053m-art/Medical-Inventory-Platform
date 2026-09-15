# =========================================================
# STAGE 1: Build React Frontend (Vite)
# =========================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY medistock-frontend/package*.json ./
RUN npm ci || npm install

COPY medistock-frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =========================================================
# STAGE 2: Build Spring Boot Backend (Java 17)
# =========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-build
WORKDIR /app/backend

COPY medistock-backend/pom.xml ./
COPY medistock-backend/src ./src

# Bundle built React frontend static assets into Spring Boot's static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static/

RUN mvn clean package -DskipTests

# =========================================================
# STAGE 3: Final Production Runtime Container
# =========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy executable Spring Boot JAR from backend build stage
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Render automatically exposes $PORT environment variable (defaults to 8081 if not set)
EXPOSE 8081

# Command to execute Spring Boot app listening on Render's dynamic PORT
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
