FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY ./mvnw .
COPY ./.mvn ./.mvn
COPY ./pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY ./src ./src

RUN ./mvnw clean package -DskipTests

CMD ["java", "-jar", "target/product-management-system-1.0.0.jar"]