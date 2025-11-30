# Multi-stage build for Java Spring Boot backend
# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /build

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Build the application - package goal includes compile
RUN mvn package -DskipTests

# Stage 2: Extract layers from fat JAR
FROM eclipse-temurin:17-jre-jammy AS builder

WORKDIR /builder

# Copy the built JAR
ARG JAR_FILE=/build/target/*.jar
COPY --from=build /build/target/*.jar application.jar

# Extract the JAR layers
RUN java -Djarmode=layertools -jar application.jar extract --destination extracted

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-jammy

WORKDIR /application

# Copy extracted layers (each COPY creates a cacheable layer)
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./

EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
