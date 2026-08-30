# 🏥 Medical Inventory Platform — Milestone 3

An enterprise-grade Medical Inventory & Procurement Management Platform built with **Spring Boot 3 (Java 17)**, **React (Vite + TypeScript)**, and **PostgreSQL**.

---

## 🎯 Milestone 3 Focus & Objectives

Milestone 3 expands the platform with **End-to-End Procurement Automation**, **Multi-Role Real-Time Notification Routing**, and **Submitted Bill Verification & Order Approval Workflows**.

---

## ✨ Key Features & Deliverables in Milestone 3

### 1. 🛒 Admin Multi-Medicine Purchase Order Dispatch
- **Dynamic Medicine Selection**: Admin can add multiple medicines to a single Purchase Order with custom quantities and dynamic unit price calculations.
- **Single Notification Rule**: Guarantees **exactly ONE `STOCK_ORDER` notification** is generated per Purchase Order (regardless of ordering 1 or 20 medicines).
- **Dynamic Amount Calculation**: Automatically computes total order value from item subtotals:
  $$\text{Total Amount} = \sum (\text{Unit Price} \times \text{Quantity})$$

---

### 2. 📦 Supplier Notification Isolation & Bill Submission
- **Targeted Notification Scope**: Notifications are strictly filtered by the authenticated Supplier's `user_id` (Supplier ABC sees only ABC's orders; Supplier Rahul sees only Rahul's orders).
- **Dynamic Order Review Modal**: Renders live ordered medicines, unit prices, quantities, and calculated subtotals.
- **Bill Submission Workflow**: Supplier clicks `Submit Bill` to send the total bill value to Admin, setting PO status to `BILL_SUBMITTED` and creating an alert for Admin.

---

### 3. 🧾 Admin Submitted Bill Review & Order Completion
- **Interactive Notification Action**: Admin clicks **`Review Bill Details →`** on any `BILL_SUBMITTED` alert to open the verification modal.
- **Complete Bill Breakdown**: Displays Purchase Order ID (`#PO-XX`), Supplier Name, Order Date, Status, Total Bill Amount, and itemized table of ordered medicines & quantities.
- **One-Click Order Completion**: **`✔ Approve Bill & Complete Order`** action updates order status to `COMPLETED` in the database.

---

### 4. 🔔 Staff Low-Stock Alert Dispatch & Admin Review
- **Staff Stock Overview**: Staff can view inventory levels and click **`🔔 Notify Admin`** next to any medicine.
- **Custom Reorder Notes**: Staff can attach custom notes (e.g. reorder urgency, recommended quantities).
- **Admin Review & Direct Procurement**: Admin receives low-stock alerts with a **`Review Low Stock →`** button opening a modal with direct **`+ Create Purchase Order`** navigation.

---

## 🏗️ System Architecture & Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.0, Spring Security (Stateless JWT), Spring Data JPA, Hibernate, PostgreSQL.
- **Frontend**: React 18, Vite 6, TypeScript, Lucide React Icons, Axios HTTP client with Bearer Token interceptor.
- **API Documentation**: OpenAPI 3 / Swagger UI (`http://localhost:8081/swagger-ui/index.html`).

---

## 📂 Project Structure

```text
Medical-Inventory-Platform/
├── README.md                           # Milestone 3 Documentation
├── medistock-backend/                  # Spring Boot 3 REST API Project
│   ├── src/main/java/com/medistock/
│   │   ├── config/                     # Security, CORS & Data Initializers
│   │   ├── controller/                 # REST Controllers (PO, Notifications, Auth)
│   │   ├── entity/                     # JPA Entities (PurchaseOrder, PurchaseOrderItem, etc.)
│   │   ├── repository/                 # Spring Data JPA Repositories
│   │   └── service/                    # Core Business Logic Services
│   └── pom.xml
└── medistock-frontend/                 # React + Vite Frontend Project
    ├── src/
    │   ├── pages/
    │   │   ├── admin/                  # Admin Purchases & Alert Center
    │   │   ├── staff/                  # Staff Stock Overview & Alert Dispatch
    │   │   └── supplier/               # Supplier PO Review & Bill Submission
    │   └── api/                        # Axios Interceptor & HTTP Client
    └── package.json
```

---

## 🚀 Execution Guide (VS Code)

### Step 1: Start Backend Server (Spring Boot)
Open VS Code Terminal:
```cmd
cd medistock-backend
.\mvnw.cmd spring-boot:run
```
📍 **Backend REST API**: `http://localhost:8081`

---

### Step 2: Start Frontend Dev Server (React + Vite)
Open a 2nd Terminal tab in VS Code:
```cmd
cd medistock-frontend
set PATH=c:\Users\hp\Documents\Medical-Inventory-Platform\node-v20.15.0-win-x64;%PATH% && npm run dev
```
📍 **Frontend Application**: `http://localhost:5173`

---

## 🔑 Verified Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `nithya` | `Admin@123` |
| **Staff** | `Stella-staff` | `User@123` |
| **Supplier ABC** | `ABC` | `ABC@123` |

---

## 🧪 Verification & Automated Test Status

- **Frontend TypeScript Build**: `0 errors` (`npx tsc --noEmit` passed cleanly).
- **Admin $\rightarrow$ Supplier PO Notification Test**: `PASSED` (Single notification generated per PO).
- **Total Amount Consistency Test**: `PASSED` (Admin total = Supplier notification total = Supplier PO total).
- **Submitted Bill Approval Test**: `PASSED` (Status updated from `BILL_SUBMITTED` to `COMPLETED`).
