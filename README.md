# MediStock

## Medical Inventory Management Platform

MediStock is a full-stack Medical Inventory Management System designed for pharmacies, hospitals, and healthcare organizations. The platform helps manage medicine inventory, monitor stock levels, track medicine expiry, manage suppliers, and generate inventory reports through a secure, role-based web application.

---

## Current Project Status

### ✅ Phase 1: Project Setup Completed

### Backend

* Spring Boot project initialized using Maven.
* Java 21 configured.
* Professional package structure created.
* PostgreSQL integrated.
* Database connection configured successfully.
* Spring Boot application running successfully on **http://localhost:8080**.

### Frontend

* React project created using Vite.
* JavaScript template selected.
* Tailwind CSS installed.
* React Router configured.
* Axios installed for API communication.
* React Icons installed.
* React Toastify installed.
* JWT Decode library installed.
* Frontend development server configured.

---

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router DOM
* React Icons
* React Toastify

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* Maven
* PostgreSQL
* Hibernate

### Database

* PostgreSQL

### Tools

* Git
* GitHub
* VS Code
* Postman
* pgAdmin

---

## Project Structure

text
Medical-Inventory-Platform
│
├── backend
│   ├── src
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── database
│
├── docs
│
├── MediStock_Project_Documentation.docx
└── README.md


---

## Backend Package Structure

text
com.medistock
│
├── config
├── constant
├── controller
├── dto
├── entity
├── exception
├── mapper
├── repository
├── security
├── service
│   └── impl
├── util
└── BackendApplication.java


---

## Database Configuration

Database Name:

text
medistock


Application is configured to use PostgreSQL through `application.properties`.

---

## Setup Instructions

### Backend

```bash
cd medistock-backend
mvn spring-boot:run
```

Application URL:
```text
http://localhost:8081
```

Swagger API Docs:
```text
http://localhost:8081/swagger-ui.html
```

---

### Frontend

```bash
cd medistock-frontend
npm install
npm run dev
```

Application URL:
```text
http://localhost:5173
```

---

## Default Login Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medistock.com` | `admin123` | Full administrative control, user & inventory management |
| **Staff** | `staff@medistock.com` | `password123` | Inventory viewing, medicine catalogue, stock history |
| **Pharmacist** | `pharmacist@medistock.com` | `password123` | Point of Sale (POS), customer sales, prescriptions |
| **Store Manager** | `store_manager@medistock.com` | `password123` | Stock In/Out, supplier orders, inventory adjustments |
| **Supplier** | `supplier@medistock.com` | `password123` | Supplier portal, order fulfillment, shipping updates |

---

## Completed Milestones & Feature Suite

* ✅ **JWT Authentication & Role-Based Access Control**: Secure login/registration with granular roles (`ADMIN`, `PHARMACIST`, `STORE_MANAGER`, `STAFF`, `SUPPLIER`).
* ✅ **Medicine Inventory & Batch Management**: Complete CRUD, multi-criteria filtering, stock tracking, and batch control.
* ✅ **Real-Time Stock Alerts & Auditing**: Low-stock threshold alerts, out-of-stock monitoring, and automated stock movement audit trails (`IN`, `OUT`, `ADJUSTMENT`).
* ✅ **Automated Expiry Tracking**: Expiry date status automation (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`) with cron background checks.
* ✅ **Supplier Management & Procurement**: Supplier directory, Purchase Orders (`PENDING`, `APPROVED`, `SHIPPED`, `RECEIVED`), shipment tracking, and isolated Supplier Portal.
* ✅ **Customer & Prescription Management**: Customer registry, prescription image uploads, admin prescription verification, and order fulfillment.
* ✅ **Point of Sale (POS) & Billing**: Walk-in and prescription sales recording, automatic stock deduction, itemized invoice generation.
* ✅ **In-App Messaging & Communication**: Real-time communication between administrators, pharmacists, and suppliers linked to purchase orders.
* ✅ **Executive Dashboard & Analytics**: Visual KPIs, inventory valuation, stock movement breakdowns, revenue trends, and supplier performance.
* ✅ **Exportable System Reports**: One-click CSV exports for inventory, low stock, expired batches, audit trails, suppliers, and purchase orders.
* ✅ **Comprehensive Postman API Collection**: Full v2.1.0 collection with automated JWT token extraction and request tests.

---

## Author

**Nallabhavitha** & **Vishnu Yaragalla**

---

## License

This project is being developed as part of the **Infosys Springboard Internship**.

