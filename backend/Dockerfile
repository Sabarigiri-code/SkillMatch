# Stage 1: Build the Spring Boot application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/skillmatch-ai-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]

