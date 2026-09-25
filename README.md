# MediStock Pro — Medical Inventory Management Platform

> **Infosys Springboard Internship Project · B.Tech Computer Science Engineering**
> A production-ready, enterprise full-stack medical inventory management system built with Spring Boot 3 + React 18.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Swagger UI](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?logo=swagger&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)

---


## 🌐 Live Deployment

**Frontend / Application:** https://medical-inventory-management-zeta.vercel.app/login

## 📋 Project Overview

**MediStock Pro** is an enterprise-level medical inventory management platform designed for hospitals, clinics, and retail pharmacies. It replaces error-prone manual processes with a secure, scalable, real-time digital solution covering every aspect of medical supply chain management — from medicine catalog management to purchase orders, sales billing, expiry monitoring, and automated alerting.

### 🎯 Project Objectives

| # | Objective |
|---|-----------|
| O1 | Secure role-based authentication with JWT tokens |
| O2 | Comprehensive medicine and category management (CRUD) |
| O3 | Real-time inventory tracking with low-stock & expiry alerts |
| O4 | Purchase order management with auto stock update on receipt |
| O5 | Sales recording with automatic stock deduction |
| O6 | Analytical dashboard KPIs and detailed report generation |
| O7 | Complete audit trails via stock movement logs |
| O8 | Multi-role access: Admin, Pharmacist, Inventory Manager, Staff |
| O9 | Responsive modern UI (desktop + tablet) with dark/light mode |
| O10 | Containerized Docker deployment ready for production |

---

## 🚀 Key Features

- 🔐 **JWT Authentication** — Secure login with BCrypt passwords and Bearer token auth
- 💊 **Medicine Catalog** — Full CRUD with category, supplier, HSN code, MRP management
- 📦 **Real-Time Inventory** — Batch/expiry tracking, low-stock alerts, stock adjustments
- 🚚 **Supplier Management** — Supplier profiles, GST numbers, license numbers, performance tracking
- 🛒 **Purchase Orders** — Multi-item POs with PENDING → RECEIVED workflow, auto stock-in
- 🧾 **Sales & Billing** — Multi-item sales with cash/card/UPI/insurance, auto stock-out
- 🔔 **Smart Alerts** — Scheduled low-stock & expiry alerts (30/60/90 days), acknowledge/resolve
- 📊 **Analytics Dashboard** — Real-time KPI cards, monthly revenue charts, inventory value
- 📈 **Reports** — Inventory valuation, purchase history, expiry risk, sales performance, stock movements
- 👥 **Employee Management** — Profile management linked to user accounts with role assignment
- 🌗 **Dark / Light Mode** — Animated theme toggle pill with glassmorphism UI
- 🐳 **Docker Ready** — Full containerization with Docker Compose (3 services)

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, Recharts, Lucide Icons, Axios |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| **Security** | JWT (JJWT 0.12.5), BCrypt, CORS configuration |
| **Database** | H2 in-memory (dev) / MySQL 8.0, Hibernate ORM, HikariCP |
| **DevOps** | Docker, Docker Compose, Maven 3.9, Node.js 20+ |
| **Scheduler** | Spring `@Scheduled` — daily alert engine at 6 AM |

---

## 📁 Project Structure

```
MedicalInventoryManagement/
├── backend/                          # Spring Boot 3.2.5 Application
│   ├── src/main/java/com/medicalinventory/
│   │   ├── MedicalInventoryApplication.java
│   │   ├── config/
│   │   │   ├── DataInitializer.java  # Auto-seeds sample data on startup
│   │   │   └── SecurityConfig.java   # Spring Security + CORS config
│   │   ├── controller/               # 10 REST Controllers
│   │   ├── service/                  # Business Logic Services
│   │   ├── repository/               # Spring Data JPA Repositories (11)
│   │   ├── entity/                   # 13 JPA Entities
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── security/                 # JWT Filter, JwtUtil, UserDetailsService
│   │   └── exception/                # Global Exception Handler
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # React 18 + Vite Application
│   ├── src/
│   │   ├── pages/                    # 13 Page Components
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── dashboard/            # Dashboard (Admin + Pharmacist view)
│   │   │   ├── medicines/            # Medicines CRUD + search/filter
│   │   │   ├── inventory/            # Inventory tracking + adjustments
│   │   │   ├── suppliers/            # Supplier CRUD + performance
│   │   │   ├── purchases/            # Purchase orders
│   │   │   ├── sales/                # Sales & billing
│   │   │   ├── employees/            # Employee profiles
│   │   │   ├── alerts/               # Alert center
│   │   │   ├── reports/              # Report generation + export
│   │   │   ├── profile/              # User profile + password change
│   │   │   ├── settings/             # Notification & theme settings
│   │   │   └── projectplan/          # In-app project plan viewer
│   │   ├── components/               # Navbar, Sidebar, ThemeToggle, CommandPalette
│   │   ├── context/                  # AuthContext, ThemeContext
│   │   ├── api/                      # axiosInstance + services.js
│   │   ├── layouts/                  # MainLayout, AuthLayout
│   │   └── routes/                   # PrivateRoute guard
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                    # 13-table normalized PostgreSQL schema
│   └── sample_data.sql               # Realistic seed data (10 medicines, 10 suppliers...)
│
├── docs/
│   ├── week1_documentation.md        # Requirements, FR/NFR, problem statement
│   ├── week2_documentation.md        # Frontend dev, integration, testing
│   └── diagrams.md                   # Architecture, ER, workflow diagrams
│
└── docker-compose.yml                # 3-service Docker Compose
```

---

## 🚀 Quick Start

### Option A: Local Development (H2 In-Memory — Recommended)

> No database installation needed! H2 auto-seeds all data on startup.

#### Prerequisites
- Java 21 JDK + Maven 3.9
- Node.js 20+ + npm

#### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
# API: http://localhost:8080/api
# H2 Console: http://localhost:8080/api/h2-console (sa / no password)
```

#### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

### Option B: Docker Compose (PostgreSQL Production Mode)

```bash
git clone <repo-url>
cd MedicalInventoryManagement
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| MySQL Database | localhost:3306 |

### Option C: MySQL 8.0 Manual Setup

```sql
CREATE DATABASE medical_inventory_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'medinv_user'@'localhost' IDENTIFIED BY 'MedInv@2024';
GRANT ALL PRIVILEGES ON medical_inventory_db.* TO 'medinv_user'@'localhost';
FLUSH PRIVILEGES;
```

```bash
mysql -u medinv_user -p medical_inventory_db < database/schema.sql
mysql -u medinv_user -p medical_inventory_db < database/sample_data.sql
```

Then set environment variables:
```bash
DB_URL=jdbc:mysql://localhost:3306/medical_inventory_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=medinv_user
DB_PASSWORD=MedInv@2024
DB_DRIVER=com.mysql.cj.jdbc.Driver
```

---

## 🧪 Automated Testing Suite

MediStock Pro includes a comprehensive test suite across backend and frontend layers:

### Backend Unit & Integration Tests (JUnit 5 + Mockito + MockMvc)
```bash
cd backend
mvn test
```
- `JwtUtilTest` — JWT creation, claim parsing, expiration, tampering checks.
- `InventoryServiceTest` — stock adjustment bounds, low-stock threshold triggers, audit movements.
- `SaleServiceTest` — multi-item billing calculations, tax/discount logic, automatic inventory decrement.
- `AuthControllerTest` — MockMvc testing of `/api/auth/login` token generation.
- `MedicineControllerTest` — MockMvc testing of catalog search and retrieval endpoints.

### Frontend Component Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
- Component smoke tests, ThemeContext light/dark mode toggling, Breadcrumbs navigation routing.


---

## 🔑 Default Login Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| **Admin** | admin | admin@medicalinv.com | Admin@123 |
| **Pharmacist** | dr_patel | patel@medicalinv.com | Pharma@123 |
| **Inventory Manager** | ravi_inv | ravi@medicalinv.com | Inv@12345 |
| **Staff** | priya_staff | priya@medicalinv.com | Staff@123 |
| **Pharmacist 2** | sneha_ph | sneha@medicalinv.com | Pharma@123 |

> **Note:** H2 in-memory database is re-seeded with all sample data on every backend restart.

---

## 🌐 API Reference

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT token |
| POST | `/api/auth/register` | Register new user |

### Protected Endpoints (Bearer JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard KPI metrics |
| GET/POST/PUT/DELETE | `/api/medicines` | Medicine CRUD |
| GET | `/api/inventory` | All inventory |
| GET | `/api/inventory/low-stock` | Low stock items |
| GET | `/api/inventory/expiring?days=N` | Expiring items |
| POST | `/api/inventory/adjust` | Stock adjustment |
| GET/POST/PUT/DELETE | `/api/suppliers` | Supplier CRUD |
| GET/POST | `/api/purchases` | Purchase orders |
| PUT | `/api/purchases/{id}/receive` | Mark received → auto stock-in |
| PUT | `/api/purchases/{id}/cancel` | Cancel purchase |
| GET/POST | `/api/sales` | Sales transactions |
| PUT | `/api/sales/{id}/cancel` | Cancel sale → restore stock |
| GET | `/api/alerts` | All alerts |
| GET | `/api/alerts/active` | Active alerts only |
| PUT | `/api/alerts/{id}/acknowledge` | Acknowledge alert |
| PUT | `/api/alerts/{id}/resolve` | Resolve alert |
| GET/POST/PUT | `/api/employees` | Employee management |
| GET/POST/PUT/DELETE | `/api/categories` | Category management |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────┐
│           CLIENT LAYER — React 18 + Vite 5               │
│  Dashboard · Medicines · Inventory · Suppliers            │
│  Purchases · Sales · Alerts · Reports · Employees        │
│  AuthContext (JWT) · ThemeContext (Dark/Light)            │
│  Axios Interceptor — attaches Bearer token               │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP REST (Vite proxy → :8080)
┌──────────────────────▼───────────────────────────────────┐
│         SPRING SECURITY + JWT FILTER CHAIN               │
│  CORS → JWT Auth Filter → Role Authorization             │
│  Public: /api/auth/** | Protected: all others            │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│           REST CONTROLLERS (Spring Boot 3.2.5)           │
│  Auth · Dashboard · Medicine · Category · Inventory      │
│  Supplier · Purchase · Sales · Alert · Employee          │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│              SERVICE LAYER (Business Logic)               │
│  Stock calc · Alert engine · Report generation           │
│  @Scheduled: AlertService daily at 6 AM                  │
└──────────────────────┬───────────────────────────────────┘
                       │ JPA / Hibernate
┌──────────────────────▼───────────────────────────────────┐
│        DATABASE — H2 (dev) / PostgreSQL 16 (prod)        │
│  13 Tables · HikariCP Pool · ACID Transactions           │
│  roles · users · employees · categories · suppliers      │
│  medicines · inventory · purchases · purchase_items      │
│  sales · sale_items · stock_movements · alerts           │
└──────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Access Control

| Module | ADMIN | PHARMACIST | INV. MANAGER | STAFF |
|--------|:-----:|:----------:|:------------:|:-----:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Medicines View | ✅ | ✅ | ✅ | ✅ |
| Medicines CRUD | ✅ | ✅ | ✅ | ❌ |
| Medicines Delete | ✅ | ❌ | ❌ | ❌ |
| Inventory View | ✅ | ✅ | ✅ | ✅ |
| Stock Adjustment | ✅ | ❌ | ✅ | ❌ |
| Suppliers | ✅ | ❌ | ✅ | ❌ |
| Purchases | ✅ | ❌ | ✅ | ❌ |
| Sales | ✅ | ✅ | ❌ | ❌ |
| Alerts View | ✅ | ✅ | ✅ | ✅ |
| Alerts Manage | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ❌ | ✅ | ❌ |
| Employees CRUD | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

---

## 🗄 Database Tables

| Table | Purpose |
|-------|---------|
| `roles` | ADMIN, PHARMACIST, INVENTORY_MANAGER, STAFF |
| `users` | User accounts + BCrypt passwords |
| `employees` | Employee profiles linked to users |
| `categories` | Medicine categories (hierarchical) |
| `suppliers` | Supplier records with GST/license |
| `medicines` | Medicine catalog (generic, brand, HSN, MRP) |
| `inventory` | Real-time stock per batch (qty, expiry, location) |
| `purchases` | Purchase order headers |
| `purchase_items` | Purchase line items |
| `sales` | Sales transaction headers |
| `sale_items` | Sale line items |
| `stock_movements` | Complete stock audit log |
| `alerts` | System alerts (low-stock, expiry) |

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| REST API Endpoints | 40+ |
| React Pages | 13 |
| Database Tables | 13 |
| JPA Entities | 13 |
| User Roles | 4 |
| Alert Types | 5 |
| Report Types | 5 |
| Docker Services | 3 |

---

## 🔁 Key Workflows

### Purchase → Stock
```
Create PO (PENDING) → Review Items → Mark RECEIVED
→ InventoryService.adjust(+qty) → StockMovement(PURCHASE_IN) logged
```

### Sale → Stock
```
Create Sale → Check stock → Deduct qty → StockMovement(SALE_OUT) logged
→ qty < reorderLevel → LOW_STOCK alert created
```

### Alert Engine
```
@Scheduled(cron="0 0 6 * * ?") // Daily at 6 AM
→ qty < reorderLevel  → LOW_STOCK alert
→ expiry ≤ 30 days    → EXPIRY_30_DAYS alert
→ expiry ≤ 60 days    → EXPIRY_60_DAYS alert
→ expiry ≤ 90 days    → EXPIRY_90_DAYS alert
```

---

## ⚙️ Spring Boot Configuration (application.yml)

For PostgreSQL production mode, update your `application.yml`:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/medical_inventory_db}
    username: ${DB_USERNAME:medinv_user}
    password: ${DB_PASSWORD:MedInv@2024}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false
```

And add the PostgreSQL driver dependency to `pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## 🐳 Docker Compose (PostgreSQL)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: medical_inventory_db
      POSTGRES_USER: medinv_user
      POSTGRES_PASSWORD: MedInv@2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/medical_inventory_db
      DB_USERNAME: medinv_user
      DB_PASSWORD: MedInv@2024
      DB_DRIVER: org.postgresql.Driver
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📄 License

Developed for academic purposes — **Infosys Springboard Internship Program · B.Tech CSE**.

---

*Built with ❤️ using Spring Boot 3.2.5, React 18, Java 21, TailwindCSS 3, and PostgreSQL 16*
