# MedInventory Pro — Medical Inventory Management Platform

> **B.Tech Computer Science — Final Year Project**
> A production-ready, full-stack hospital/pharmacy inventory management system

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=java) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)

---

## 📋 Project Overview

MedInventory Pro is an enterprise-level medical inventory management platform designed for hospitals and pharmacies. It provides complete control over medicine catalog management, real-time stock tracking, purchase orders, sales billing, expiry monitoring, and automated alerting.

### Key Features
- 🔐 **Secure JWT Authentication** with role-based access control (Admin, Pharmacist, Inventory Manager, Staff)
- 💊 **Medicine Catalog** — complete CRUD with category/supplier management
- 📦 **Real-Time Inventory** — stock levels, low-stock alerts, expiry tracking
- 🛒 **Purchase Management** — purchase orders with receive workflow and auto stock update
- 🧾 **Sales & Billing** — multi-item sales with automatic inventory deduction
- 🔔 **Smart Alerts** — automated low-stock and expiry alerts with daily scheduler
- 📊 **Analytics Dashboard** — KPIs, charts, revenue trends
- 🐳 **Docker Ready** — full containerization with Docker Compose

---

## 🛠 Technology Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Recharts |
| Backend    | Java 21, Spring Boot 3.2.5           |
| Security   | Spring Security, JWT (JJWT 0.12.5)   |
| Database   | MySQL 8.0, Spring Data JPA / Hibernate |
| Containerization | Docker, Docker Compose         |
| Build Tool | Maven 3.9                            |

---

## 📁 Project Structure

```
MedicalInventoryManagement/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/medicalinventory/
│   │   ├── controller/         # REST Controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── entity/             # JPA Entities (13 tables)
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── security/           # JWT auth filter & config
│   │   └── exception/          # Global exception handler
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── pages/              # 10 page components
│   │   ├── components/         # Sidebar, Navbar
│   │   ├── context/            # AuthContext
│   │   ├── api/                # Axios instance + API services
│   │   ├── layouts/            # MainLayout, AuthLayout
│   │   └── routes/             # PrivateRoute guard
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   ├── schema.sql              # 13-table normalized schema
│   └── sample_data.sql         # Seed data with demo users
├── docs/
│   ├── week1_documentation.md  # Requirements & objectives
│   └── diagrams.md             # Architecture & ER diagrams
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A: Docker Compose (Recommended)
```bash
# Clone and run with Docker
cd MedicalInventoryManagement
docker-compose up --build
```
- Frontend: http://localhost:80
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306

### Option B: Local Development

#### Prerequisites
- Java 21 JDK, Maven 3.9
- Node.js 20+, npm
- MySQL 8.0

#### Database
```sql
CREATE DATABASE medical_inventory_db;
CREATE USER 'medinv_user'@'localhost' IDENTIFIED BY 'MedInv@2024';
GRANT ALL PRIVILEGES ON medical_inventory_db.* TO 'medinv_user'@'localhost';
mysql -u root -p medical_inventory_db < database/schema.sql
mysql -u root -p medical_inventory_db < database/sample_data.sql
```

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Running at http://localhost:8080/api
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

---

## 🔑 Default Login Credentials

| Role              | Email                        | Password  |
|-------------------|------------------------------|-----------|
| Admin             | admin@medicalinv.com         | Admin@123 |
| Pharmacist        | pharmacist@medicalinv.com    | Admin@123 |
| Inventory Manager | inventory@medicalinv.com     | Admin@123 |

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description            | Auth Required |
|--------|-----------------------------|------------------------|---------------|
| POST   | /api/auth/login             | User login             | ❌ Public     |
| POST   | /api/auth/register          | New user registration  | ❌ Public     |
| GET    | /api/dashboard/stats        | Dashboard KPIs         | ✅ JWT        |
| GET    | /api/medicines              | List medicines         | ✅ JWT        |
| POST   | /api/medicines              | Create medicine        | ✅ JWT        |
| GET    | /api/inventory              | List inventory         | ✅ JWT        |
| GET    | /api/inventory/low-stock    | Low stock items        | ✅ JWT        |
| POST   | /api/inventory/adjust       | Adjust stock           | ✅ JWT        |
| GET    | /api/purchases              | List purchases         | ✅ JWT        |
| PUT    | /api/purchases/{id}/receive | Receive purchase       | ✅ JWT        |
| GET    | /api/sales                  | List sales             | ✅ JWT        |
| POST   | /api/sales                  | Create sale            | ✅ JWT        |
| GET    | /api/alerts/active          | Active alerts          | ✅ JWT        |
| PUT    | /api/alerts/{id}/resolve    | Resolve alert          | ✅ JWT        |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                        │
│  Pages: Dashboard, Medicines, Inventory, Purchases, Sales,       │
│         Suppliers, Employees, Alerts, Reports, Profile           │
│  State: AuthContext (JWT) · API: Axios + Services layer          │
└─────────────────────────────────────────────────────────────────┘
                          │ HTTP REST
┌─────────────────────────────────────────────────────────────────┐
│               Spring Boot REST API (Port 8080)                    │
│  Security: JWT Filter → SecurityConfig → Role-based endpoints    │
│  Layers: Controller → Service → Repository → JPA Entities        │
│  Scheduled: AlertService @Scheduled(cron) - daily at 6 AM       │
└─────────────────────────────────────────────────────────────────┘
                          │ JPA/Hibernate
┌─────────────────────────────────────────────────────────────────┐
│                  MySQL 8.0 Database                               │
│  13 Tables: users, roles, employees, categories, suppliers,      │
│             medicines, inventory, purchases, purchase_items,      │
│             sales, sale_items, stock_movements, alerts           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

```bash
# Backend unit/integration tests
cd backend && mvn test

# Frontend (if configured)
cd frontend && npm test
```

---

## 👥 Role-Based Access Control

| Feature             | ADMIN | PHARMACIST | INV. MANAGER | STAFF |
|---------------------|-------|------------|--------------|-------|
| Dashboard           | ✅    | ✅         | ✅           | ✅    |
| Medicines CRUD      | ✅    | ✅         | ✅           | 👁️   |
| Inventory View      | ✅    | ✅         | ✅           | ✅    |
| Stock Adjustment    | ✅    | ❌         | ✅           | ❌    |
| Purchases           | ✅    | ❌         | ✅           | ❌    |
| Sales               | ✅    | ✅         | ❌           | ❌    |
| Suppliers           | ✅    | ❌         | ✅           | ❌    |
| Reports             | ✅    | ❌         | ✅           | ❌    |
| User Management     | ✅    | ❌         | ❌           | ❌    |

---

## 📄 License

This project is developed for academic purposes as part of a B.Tech Computer Science final year project.

---

*Built with ❤️ using Spring Boot 3, React 18, and Java 21*
