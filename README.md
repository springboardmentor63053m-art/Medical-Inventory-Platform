# 🏥 MediStock: Medical Inventory Management Platform

An enterprise-grade, full-stack Medical Inventory & Procurement Management Platform built with **Spring Boot** (Java 17), **React.js** (Vite, TypeScript, Tailwind CSS), and **PostgreSQL** in production.

---

## 🎯 1. Title & Objective

### Title
**MediStock: Medical Inventory Management Platform**

### Objective
Build a full-stack web application (React.js frontend + Spring Boot backend) that allows pharmacies, hospitals, and healthcare organizations to manage medicine inventory, track stock availability, monitor expiry dates, maintain supplier records, and generate inventory analytics.

The system provides real-time stock updates, low-stock notifications, expiry monitoring, supplier management, and inventory dashboards for efficient medicine inventory management.

### Key Outcomes
- **Full-Stack Application**: Developed and deployed a unified React.js + Spring Boot application.
- **Secure Authentication**: Implemented role-based access control with JWT and OAuth2 support.
- **Medicine & Stock Management**: Real-time stock updates, batch tracking, and category management.
- **Expiry & Alert Systems**: Automated low-stock alerts, near-expiry tracking, and notification routing.
- **Supplier & Procurement Systems**: Supplier records, purchase order management, and bill verification workflows.
- **Analytics & Dashboards**: Dedicated Admin and Pharmacist/Staff dashboards for inventory monitoring and reporting.
- **Search & Filtering**: Comprehensive search by medicine name, category, supplier, batch number, expiry date, and stock status.
- **Production Deployment**: Containerized with Docker and deployed with PostgreSQL on Render.

---

## 🏗️ 2. Architecture Diagram

```text
 +-----------------------------------------------------------------------------------+
 |                                   CLIENT LAYER                                    |
 |  [ Web Application (React.js) ]           [ Mobile Application (React Native) ]   |
 |  - Dashboards, Stock Updates, Notifications, Reports & Analytics                   |
 +-----------------------------------------+-----------------------------------------+
                                           | HTTPS / REST API Calls
                                           v
 +-----------------------------------------------------------------------------------+
 |                          API GATEWAY & SECURITY LAYER                             |
 |  - JWT Authentication  - Authorization  - Role-Based Access  - CORS Validation    |
 +-----------------------------------------+-----------------------------------------+
                                           |
                                           v
 +-----------------------------------------------------------------------------------+
 |                           BACKEND SERVICES (SPRING BOOT)                          |
 |  [ Auth Service ]           [ User & Role Service ]    [ Medicine Inventory ]    |
 |  [ Supplier Management ]    [ Stock Monitoring ]       [ Expiry Tracking ]       |
 |  [ Purchase Order ]         [ Analytics & Reporting ]  [ Notification Service ]  |
 +-----------------------------------------+-----------------------------------------+
                                           |
                                           v
 +-----------------------------------------------------------------------------------+
 |                                DATA LAYER & STORAGE                               |
 |  [ PostgreSQL Database ]                                                          |
 |  - Master Data Tables (Users, Roles, Suppliers)                                   |
 |  - Inventory Tables (Medicines, Batches, Inventory, Stock Logs)                   |
 |  - Transaction & Tracking (Purchase Orders, Expiry Tracking, Notifications)       |
 +-----------------------------------------------------------------------------------+
```

---

## 🧩 3. Modules Implemented

### 1. User Authentication & Role-Based Access
- **Authentication**: JWT Token Authentication & OAuth2 Login.
- **User Management**: Role Management, Password Reset, User Profile Management.
- **Roles**:
  - `Admin`: Full system access, user management, inventory analytics, purchase order approval.
  - `Pharmacist`: Inventory overview, stock management, expiry monitoring, purchase summaries.
  - `Staff`: Stock monitoring, low-stock alert dispatch to Admin.
  - `Supplier`: Purchase order review, order status tracking, bill submission.

### 2. Medicine Inventory Management
- **Actions**: Add medicines, update stock quantities, delete medicines, manage categories, track batches, inventory history.
- **Medicine Details**: Name, Batch Number, Category, Supplier, Quantity, Manufacturing Date, Expiry Date, Price.

### 3. Supplier Management System
- **Features**: Add supplier details, manage contacts, track supplier purchases, supplier history, performance tracking.
- **Supplier Information**: Supplier Name, Contact Number, Email, Address, Supplied Medicines.

### 4. Stock Monitoring & Alerts
- Real-time stock tracking.
- Low-stock & out-of-stock notifications.
- Automatic stock updates and inventory movement tracking.

### 5. Expiry Tracking System
- Medicine expiry monitoring & near-expiry tracking.
- Expired stock management & expiry reports.
- Automated expiry alerts.

### 6. Search & Filtering System
- Search and filter medicines by: **Name**, **Category**, **Supplier**, **Batch Number**, **Expiry Date**, and **Stock Status**.

### 7. Dashboard & Analytics
- **Pharmacist Dashboard**: Inventory overview, low-stock items, expiring medicines, purchase summary, supplier insights.
- **Admin Dashboard**: Inventory analytics, user activity, supplier analytics, stock movement reports, system monitoring.

### 8. Notification & Reminder System
- Low-stock notifications, expiry alerts, inventory reminders, purchase order alerts, email & push notifications.

### 9. Reports & Data Export
- Generate inventory reports, purchase history reports, and expiry reports.
- Export stock data with downloadable PDF and Excel options.

### 10. Integration, Testing & Deployment
- Docker containerization for unified frontend + backend deployment.
- Deployed on Render using PostgreSQL.
- End-to-end API validation and security testing.

---

## 📅 4. Week-Wise Milestone Implementation

| Milestone | Period | Focus & Tasks | Key Outcomes |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | Week 1 & 2 | Requirements, Database Design (Users, Roles, Medicines, Suppliers, Inventory, Orders), Spring Boot & React Setup, JWT Auth. | Architecture setup complete, authentication functional, database schema finalized. |
| **Milestone 2** | Week 3 & 4 | Medicine Inventory APIs, Supplier Management, Medicine Dashboards, Stock Tracking, Search & Filtering. | Inventory management operational, supplier workflow functional, dynamic stock tracking. |
| **Milestone 3** | Week 5 & 6 | Expiry Tracking System, Low-Stock Alert Dispatch, Purchase Order Workflows, Notification Integrations. | Expiry monitoring active, alert & notification system functional, purchase order flow complete. |
| **Milestone 4** | Week 7 & 8 | Analytics Dashboard, Visual Charts & Reports, Docker Containerization, Deployment on Render/AWS, CORS & SSL setup. | Production-ready deployed app on Render, complete end-to-end demonstrable workflow. |

---

## 🛠️ 5. Tools & Tech Stack

| Domain | Technology / Tool |
| :--- | :--- |
| **Programming Languages** | Java 17, JavaScript (ES6+), TypeScript |
| **Backend Framework** | Spring Boot 3.3.0, Spring Security, Spring Data JPA, Hibernate, Maven |
| **Frontend Framework** | React 18 (Vite 6), React Router, Axios, Tailwind CSS, Context API, Framer Motion |
| **Database** | MySQL (Development), PostgreSQL (Production) |
| **Authentication** | Spring Security, JWT (JSON Web Tokens), OAuth2 (Google Login) |
| **Notifications** | JavaMailSender, Firebase Cloud Messaging (FCM), Twilio |
| **Testing Tools** | JUnit, Mockito, Postman, React Testing Library |
| **Dev & Deployment Tools** | VS Code, IntelliJ IDEA, Git & GitHub, Docker, Docker Compose, Render / AWS, Postman |

---

## 📊 6. Performance Metrics & Quantitative Goals

### Inventory & Stock Metrics
- **Stock Tracking Accuracy**: Real-time accurate reconciliation of medicine inventory.
- **Inventory Update Success Rate**: 100% reliable stock level updates on purchase approvals.
- **Medicine Search Efficiency**: Fast indexing and multi-criteria filtering by name, category, and batch.

### Expiry & Alert Metrics
- **Expiry Detection Accuracy**: Proactive identification of near-expiry and expired medicine batches.
- **Notification Delivery**: Immediate delivery of low-stock alerts and order status updates.

### Supplier & Platform Performance
- **Order Processing Efficiency**: Streamlined PO creation, supplier bill submission, and admin approval.
- **System Metrics**: Low API response time, rapid dashboard load speed, and efficient database query execution.

---

## 🚀 7. How to Run Locally

### Prerequisites
- Java 17 JDK
- Node.js (v20+)
- Maven / `mvnw`

### 1. Start Backend (Spring Boot)
```cmd
cd medistock-backend
.\mvnw.cmd spring-boot:run
```
📍 **Backend REST API**: `http://localhost:8081`

### 2. Start Frontend (React + Vite)
```cmd
cd medistock-frontend
npm run dev
```
📍 **Frontend App**: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `nithya` | `Admin@123` |
| **User** | `priya` | `Priya@123` |
| **Pharmacist** | `Kavya` | `Kavya@123` |
| **Supplier** | `Healthcare` | `Healthcare@123` |
|**Staff** |`Sweety` |`Sweety@123` |
