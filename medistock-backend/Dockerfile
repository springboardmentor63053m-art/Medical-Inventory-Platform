# =========================================================
# Build Frontend
# =========================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY medistock-frontend/package*.json ./
RUN npm install

COPY medistock-frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# =========================================================
# Build Backend
# =========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-build

WORKDIR /app/backend

COPY medistock-backend/pom.xml ./
COPY medistock-backend/src ./src

# Copy React build into Spring Boot static folder
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static/

RUN mvn clean package -DskipTests


# =========================================================
# Run Application
# =========================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=backend-build /app/backend/target/*.jar app.jar

EXPOSE 8081

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]