# Medical-Inventory-Platform
Infosys Springboard Project
# Medical Inventory Management System - Backend

This is a production-ready Spring Boot backend for the Medical Inventory Management System, developed as part of the **Infosys Virtual Internship 7.0** program. 

The system provides a robust RESTful API to manage medical supplies, track inventory levels, monitor expiry dates, manage suppliers, and handle purchase orders with secure JWT-based authentication.

## 🚀 Tech Stack

* **Java 17** - Core programming language
* **Spring Boot 3.3.0** - Backend framework
* **Spring Data JPA & Hibernate** - ORM for database operations
* **PostgreSQL** - Relational database
* **Spring Security & JJWT** - Authentication and authorization
* **Maven** - Dependency and build management
* **Lombok** - Boilerplate code reduction

## 📦 Core Modules

* **User & Role Management**: Secure registration and login utilizing JWT tokens.
* **Medicine Management**: Full CRUD operations with search-by-name capabilities.
* **Inventory & Stock Tracking**: Real-time stock updates and logging of all stock modifications.
* **Expiry Tracking**: Automated tracking to fetch medicines nearing expiration.
* **Supplier & Purchase Orders**: Manage suppliers and record complex purchase order details.
* **Notifications**: Alert system for users regarding low stock or expirations.

## ⚙️ Setup & Installation

### Prerequisites
* JDK 17 installed
* Maven installed
* PostgreSQL installed and running

### 1. Database Setup
Create a new PostgreSQL database named `medistock_db`:
```sql
CREATE DATABASE medistock_db;
```

### 2. Configuration
Open `src/main/resources/application.properties` and verify your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medistock_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```
*(Note: `spring.jpa.hibernate.ddl-auto=create` is enabled by default to automatically generate tables on the first run. Switch it to `update` for production).*

### 3. Run the Application
Navigate to the project root directory and run:
```bash
./mvnw clean compile spring-boot:run
```
The server will start on **http://localhost:8081**.

## 🔐 Authentication & API Testing
All endpoints (except `/api/auth/**`) are protected. 

1. **Register**: Send a POST request to `/api/auth/register` to create an account.
2. **Login**: Send a POST request to `/api/auth/login` to obtain a JWT Token.
3. **Access APIs**: Pass the token in the `Authorization` header as `Bearer <your_token>` for all subsequent requests.

*A comprehensive Postman Collection is available to easily test all endpoints.*

## 📂 Project Structure
Following Clean Architecture principles:
* `config/` - App configurations and Data Initializers (Roles are seeded automatically).
* `controller/` - REST API endpoints.
* `service/` - Business logic interfaces and implementations.
* `repository/` - Data access interfaces extending JpaRepository.
* `entity/` - Database models and schema definitions.
* `security/` - JWT filters, WebSecurity configs, and UserDetails logic.
* `dto/` - Data Transfer Objects for clean API payloads.

---
**Developed for the Infosys Virtual Internship 7.0 Project.**
