<div align="center">
  
# 🏥 Medistock Backend API
**An Enterprise-Grade Medical Inventory Management System**

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=java&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![JWT](https://img.shields.io/badge/JWT-Security-black?style=for-the-badge&logo=JSON%20web%20tokens)]()
[![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)]()

</div>

---

## 📖 Overview

The **Medistock Backend** is a highly scalable, secure RESTful API built to power a modern Medical Inventory Management System. It serves as the core engine handling everything from real-time stock tracking and expiry management to secure, role-based user authentication. 

Designed with enterprise best practices in mind, this backend provides a seamless foundation for frontend teams to build upon.

## ✨ Key Features

- 🔐 **Robust Security**: Fully stateless JWT (JSON Web Token) authentication with strict Role-Based Access Control (Admin vs. User).
- 📦 **Smart Inventory Tracking**: Monitor medicine levels, automatically track expiration dates, and manage batch numbers.
- 🚚 **Supplier Integration**: End-to-end management of purchase orders and supplier catalogs.
- 📊 **Real-time Logging**: Comprehensive stock movement logs (In/Out) and system notifications.
- 🛠️ **Environment Resilient**: 100% Pure Java codebase. (Lombok dependencies have been explicitly compiled out to ensure flawless execution across all Java Development Kits without `TypeTag` or annotation processor bugs).
- 📜 **Interactive Documentation**: Beautiful, auto-generated Swagger UI dashboard for seamless API testing and frontend integration.

---

## 🏗️ Architecture & Project Structure

The codebase strictly adheres to the standard layered architecture pattern (Controller -> Service -> Repository -> Entity) to ensure maximum maintainability and separation of concerns.

```text
medistock-backend/
├── src/main/java/com/medistock/medistockbackend/
│   ├── config/          # Spring Security, CORS, and Data Initialization
│   ├── controller/      # REST API Endpoints 
│   ├── dto/             # Data Transfer Objects for API requests/responses
│   ├── entity/          # JPA Database Entities (User, Medicine, Role, etc.)
│   ├── repository/      # Spring Data JPA Interfaces
│   ├── security/        # JWT Filters, EntryPoints, and UserDetails
│   ├── service/         # Core Business Logic and Interfaces
│   └── MedistockBackendApplication.java
└── pom.xml              # Maven dependencies and build configurations
```

---

## 🚀 Getting Started

Follow these steps to run the backend server on your local machine.

### Prerequisites
- **Java**: JDK 17 or higher
- **Maven**: v3.8+ (Or use the provided Maven wrapper)
- **Database**: PostgreSQL (Running on default port `5432`)

### 1. Database Setup
Ensure your local PostgreSQL server is active. Create an empty database named `medistock_db`. 
*Note: Hibernate is configured to automatically generate all tables (`ddl-auto=create`) upon the first startup.*

Verify your database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medistock_db
spring.datasource.username=postgres
spring.datasource.password=root
```

### 2. Launching the Application
Open your terminal, navigate to the project root, and execute the following Maven command:

```bash
mvn clean compile spring-boot:run
```

The server will successfully initialize and bind to **Port 8080**.

---

## 🔌 API Documentation & Testing

This project uses SpringDoc OpenAPI to dynamically generate interactive documentation. 

Once the Spring Boot application is running, open your web browser and navigate to:

> 🌐 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

From the Swagger UI dashboard, you can:
1. Register a new user via the `/api/auth/register` endpoint.
2. Login via `/api/auth/login` to receive a JWT Token.
3. Authenticate the Swagger dashboard using the **Authorize** button at the top to test secure endpoints.

---

## 🛡️ Security Configuration

By default, all functional endpoints require a valid JWT token passed in the `Authorization` header.
- **Public Endpoints**: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- **Secured Endpoints**: `/api/medicines/**`, `/api/inventories/**`, etc.

*An unauthorized request to a secured endpoint will be intercepted by the global error handler and return a 401 Unauthorized status.*

---
<div align="center">
  <i>Developed for the Infosys Virtual Internship 7.0</i>
</div>
