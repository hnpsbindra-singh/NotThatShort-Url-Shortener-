# ==============================================================================
# NotThatShort — Multi-Stage Production Dockerfile for Render Deployment
# ==============================================================================

# Stage 1: Build the Spring Boot application jar
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Copy dependency configuration and warm offline cache
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production package (skipping tests for quick deploy)
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure JRE runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user execution for container hardening
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built artifact from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Render automatically sets $PORT environment variable at runtime
ENV PORT=8080
EXPOSE ${PORT}

# Run with container-aware JVM flags and dynamic port binding
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.jar"]
