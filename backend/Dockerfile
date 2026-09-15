# --- Build stage ---
# Java 17 to match pom.xml's <java.version>17</java.version> (requirement 38:
# "Use Java 17 consistently... Do not unnecessarily migrate to Java 21").
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Cache dependencies separately from source so code-only changes don't
# re-download the whole Maven repo on every build.
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S medistock && adduser -S medistock -G medistock
COPY --from=build /app/target/*.jar app.jar
USER medistock
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
