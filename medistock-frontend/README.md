# MediStock Frontend Web Application 💊💻

[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router 7](https://img.shields.io/badge/React%20Router-7.18.2-CA4245.svg?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Charts-Recharts-22b5bf.svg)](https://recharts.org/)
[![License](https://img.shields.io/badge/Project-Infosys%20Springboard-blueviolet.svg)]()

> **MediStock Frontend** is a modern, responsive Single Page Application (SPA) designed for hospital pharmacies, store managers, suppliers, and administrative staff. Built with **React 19**, **Vite**, and **Tailwind CSS**, it provides an intuitive, high-performance user interface for real-time inventory tracking, batch management, POS billing, prescription verification, supplier ordering, and visual analytics.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Page & Feature Overview](#-page--feature-overview)
- [Role-Based Access Control & Navigation](#-role-based-access-control--navigation)
- [State Management & Context Architecture](#-state-management--context-architecture)
- [Environment Configuration](#-environment-configuration)
- [Installation & Setup](#-installation--setup)
- [Available Scripts](#-available-scripts)
- [API Communication & Interceptors](#-api-communication--interceptors)
- [Default Login Credentials](#-default-login-credentials)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Key Highlights

* **Modern React 19 + Vite Architecture**: Lightning-fast Hot Module Replacement (HMR) and optimized production bundling.
* **Role-Based Dynamic Navigation**: Side navigation and page access dynamically filter based on user roles (`ADMIN`, `PHARMACIST`, `STORE_MANAGER`, `STAFF`, `SUPPLIER`).
* **Point of Sale (POS) & Invoice Generation**: Real-time sales checkout cart, customer assignment, payment method selection, and printable itemized invoices.
* **Prescription Processing Hub**: Upload prescription images, inspect medical details, and manage prescription statuses (`PENDING`, `APPROVED`, `REJECTED`, `DISPENSED`).
* **Visual Analytics & Reporting**: Interactive charts powered by Recharts (revenue trends, stock movements, category breakdowns) and one-click CSV report exports.
* **Supplier Portal & Messaging**: Dedicated interface for suppliers to manage purchase orders, update shipping statuses, and exchange messages with store managers.
* **Automated Expiry & Stock Alerts**: Visual badge indicators for low-stock thresholds, out-of-stock items, and batches expiring soon.
* **Toast Notification System**: Real-time toast feedback for all CRUD operations, errors, and system warnings.

---

## 🛠️ Technology Stack

| Layer / Library | Package | Purpose |
| :--- | :--- | :--- |
| **Framework** | `react` (v19.2.8) & `react-dom` | Core UI component engine |
| **Build Tool & Dev Server** | `vite` (v8.2.0) | High-speed ESM development server and bundler |
| **Routing** | `react-router-dom` (v7.18.2) | Client-side routing with protected route wrappers |
| **Styling & Design System** | Tailwind CSS & Custom CSS | Responsive layout, dark theme accents, glassmorphism UI |
| **HTTP Client** | `axios` (v1.19.0) | REST API requests with request/response interceptors |
| **Charts & Visualizations** | `recharts` (v3.10.1) | Area, Bar, Line, and Pie chart visualizations |
| **Icons** | `lucide-react` (v1.28.0) | Modern icon set for navigation and status badges |
| **Linter** | `oxlint` (v1.75.0) | Ultra-fast Rust-based JavaScript linting |

---

## 📂 Directory Structure

```text
medistock-frontend/
├── package.json                      # Dependencies and npm scripts
├── vite.config.js                    # Vite configuration
├── index.html                        # HTML5 root template
├── .env                              # Base environment config
├── .env.development                  # Development environment variables
├── public/                           # Static assets
└── src/
    ├── main.jsx                      # Application entry point
    ├── App.jsx                       # Top-level router and context wrapper
    ├── App.css                       # Application-wide styling
    ├── index.css                     # Global styles, variables & Tailwind directives
    │
    ├── api/                          # Axios instance & global interceptors
    │   └── axiosConfig.js            # Injects JWT Bearer token & handles 401 logouts
    │
    ├── config/                       # Configuration constants
    │   └── api.js                    # API Base URL resolver
    │
    ├── context/                      # React Context Providers
    │   ├── AuthContext.jsx           # User authentication state, login, logout & token storage
    │   └── ToastContext.jsx          # Dynamic toast alerts (success, error, info, warning)
    │
    ├── components/                   # Reusable UI Components
    │   ├── ConfirmationDialog.jsx    # Action confirmation modal (delete, dispose, etc.)
    │   ├── Modal.jsx                 # Accessible popup dialog wrapper
    │   ├── Pagination.jsx            # Dynamic table pagination controller
    │   └── ProtectedLayout.jsx       # Main layout with header, role-based sidebar & notifications
    │
    ├── pages/                        # Feature Pages (21 Page Components)
    │   ├── Login.jsx                 # Login screen with quick-fill role credentials
    │   ├── Dashboard.jsx             # Executive KPI metrics, quick actions & overview charts
    │   ├── MedicineList.jsx          # Medicine catalog CRUD, search, and batch filtering
    │   ├── InventoryList.jsx         # Live stock levels, thresholds & location manager
    │   ├── StockManagement.jsx       # Stock IN, Stock OUT, and physical count adjustment forms
    │   ├── StockHistory.jsx          # Complete stock movement audit log with filters
    │   ├── LowStockAlerts.jsx        # Warning list of items below minimum threshold
    │   ├── OutOfStockPage.jsx        # Critical items with 0 units in stock
    │   ├── ExpiryTrackingPage.jsx    # Batch expiry matrix (Active / Expiring Soon / Expired)
    │   ├── SuppliersList.jsx         # Supplier directory & contact management
    │   ├── SupplierOrdersPage.jsx    # Purchase orders creation & status tracker
    │   ├── SupplierCataloguePage.jsx # Supplier-facing portal for order fulfillment
    │   ├── SalesPage.jsx             # Point of Sale (POS) billing & cart terminal
    │   ├── BillsPage.jsx             # Invoice archive & printable receipts
    │   ├── CustomersPage.jsx         # Customer database & purchasing history
    │   ├── PrescriptionsPage.jsx     # Prescription upload, review, and dispensation
    │   ├── MessagesPage.jsx          # Order-linked chat between store and suppliers
    │   ├── NotificationsPage.jsx     # System notifications center
    │   ├── AnalyticsPage.jsx         # Deep-dive charts & business intelligence
    │   ├── ReportsPage.jsx           # One-click downloadable CSV reports
    │   └── UserManagementPage.jsx    # Admin user creation, role assignment & account status
    │
    └── styles/                       # Modular CSS stylesheets
```

---

## 🖥️ Page & Feature Overview

### 1. 📊 Executive Dashboard (`/dashboard`)
* Overview metric cards: Total Inventory Valuation, Critical Low Stock Items, Expiring Batches, and Today's Sales Revenue.
* Interactive area & bar charts showing weekly sales trends and stock movement velocity.
* Quick-action shortcuts for Stock In, POS Billing, New Order, and Report Download.

### 2. 💊 Medicine & Inventory Management (`/medicines`, `/inventory`)
* Full-text search and multi-criteria filters (Category, Stock Status, Supplier, Batch Number).
* Modal workflows to Add, Edit, or Remove medicine records.
* Manage stock thresholds: **Minimum Stock**, **Maximum Stock**, and **Shelf/Aisle Location**.

### 3. 🔄 Stock Operations & Audit Trails (`/stock-management`, `/stock-history`)
* Dedicated forms for **Stock In** (receiving shipments), **Stock Out** (dispatch/damage), and **Physical Adjustments**.
* Audit trail logging every movement with action type (`IN`, `OUT`, `ADJUSTMENT`), quantity change, timestamp, and operator identity.

### 4. ⏳ Expiry Tracking & Disposal (`/expiry`)
* Real-time categorization of stock batches into `ACTIVE`, `EXPIRING_SOON` (within 30 days), and `EXPIRED`.
* Button to trigger an immediate server-side expiry scan.
* Batch disposal workflow to securely write off expired stock.

### 5. 🛒 Point of Sale (POS) & Billing (`/sales`, `/bills`)
* Fast barcode/name medicine search with real-time price and stock validation.
* Dynamic cart calculation with discounts, tax, and multiple payment methods (Cash, Card, UPI).
* Instant printable PDF/HTML invoice generation upon checkout completion.

### 6. 📋 Prescriptions Hub (`/prescriptions`)
* Upload prescription documents (PNG, JPG, PDF) with doctor and patient metadata.
* Public image preview modal for pharmacists to verify dosage before dispensing.
* Order status workflow (`PENDING` ➔ `APPROVED` ➔ `DISPENSED`).

### 7. 🏢 Procurement & Supplier Portal (`/suppliers`, `/supplier-orders`, `/supplier-catalogue`)
* Directory of verified pharmaceutical suppliers.
* Create and track Purchase Orders (`PENDING` ➔ `APPROVED` ➔ `SHIPPED` ➔ `RECEIVED`).
* Isolated **Supplier Catalogue Portal** for logged-in suppliers to fulfill purchase orders and provide shipment tracking numbers.

### 8. 💬 In-App Messaging & Notifications (`/messages`, `/notifications`)
* Real-time conversation threads linked directly to specific purchase orders.
* System notifications for low stock warnings, expiring batches, and order updates.

### 9. 📈 Analytics & CSV Reports (`/analytics`, `/reports`)
* Visual analytics: Sales trends, category distribution, stock turnover rate.
* One-click CSV downloads for Inventory, Low Stock, Expired Batches, Audit Logs, and Purchase Orders.

### 10. 👤 User Management (`/user-management`)
* Restricted to `ADMIN` users.
* Register new staff members and assign roles (`ADMIN`, `PHARMACIST`, `STORE_MANAGER`, `STAFF`, `SUPPLIER`).

---

## 🔒 Role-Based Access Control & Navigation

The navigation sidebar and client routes dynamically adjust based on the authenticated user's role:

| Module / Page | Route | Admin | Store Manager | Pharmacist | Staff | Supplier |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Medicines** | `/medicines` | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Inventory** | `/inventory` | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Stock Management** | `/stock-management` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Stock History** | `/stock-history` | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Low / Out of Stock** | `/low-stock`, `/out-of-stock`| ✅ | ✅ | ✅ | ✅ | ❌ |
| **Expiry Tracking** | `/expiry` | ✅ | ✅ | ✅ | ❌ | ❌ |
| **POS & Billing** | `/sales`, `/bills` | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Prescriptions** | `/prescriptions` | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Customers** | `/customers` | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Suppliers & Orders** | `/suppliers`, `/supplier-orders`| ✅ | ✅ | ❌ | ❌ | ❌ |
| **Supplier Portal** | `/supplier-catalogue` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Analytics & Reports** | `/analytics`, `/reports` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Messages** | `/messages` | ✅ | ✅ | ✅ | ❌ | ✅ |
| **User Management** | `/user-management` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🧩 State Management & Context Architecture

### 1. `AuthContext` (`src/context/AuthContext.jsx`)
* Manages JWT token lifecycle in `localStorage`.
* Exposes `user`, `role`, `token`, `login()`, and `logout()`.
* Automatically attaches user permissions across components.

### 2. `ToastContext` (`src/context/ToastContext.jsx`)
* Provides global toast alerts:
  ```jsx
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  showSuccess("Stock updated successfully!");
  ```

---

## ⚙️ Environment Configuration

Frontend environment variables are specified in `.env` and `.env.development`:

```properties
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8081
```

If your backend is hosted on a different host/port, update `VITE_API_BASE_URL` accordingly.

---

## 🚀 Installation & Setup

### Prerequisites
* **Node.js**: `v18.x` or `v20.x` or later (`node -v`)
* **npm**: `v9.x` or later (`npm -v`)

### Step-by-Step Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd medistock-frontend
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite dev server with Hot Module Replacement on port `5173` |
| **Build** | `npm run build` | Compiles optimized production bundle into `/dist` |
| **Preview** | `npm run preview` | Locally preview the production build |
| **Lint** | `npm run lint` | Runs Oxlint to check code quality and syntax rules |

---

## 📡 API Communication & Interceptors

All HTTP communication with the backend is routed through [`src/api/axiosConfig.js`](file:///c:/Users/vishn/week-1%20task/medistock/medistock-frontend/src/api/axiosConfig.js):

* **Request Interceptor**: Automatically inspects `localStorage` for `medistock_token` and attaches the `Authorization: Bearer <token>` header to all outgoing requests.
* **Response Interceptor**: Catches `401 Unauthorized` responses, clears stored credentials, and safely redirects the user to `/login`.

---

## 🔑 Default Login Credentials

For convenience, the login page features clickable role badges that pre-fill credentials:

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medistock.com` | `admin123` | Full administrative control & User Management |
| **Store Manager** | `store_manager@medistock.com` | `password123` | Stock In/Out, Adjustments, Procurement |
| **Pharmacist** | `pharmacist@medistock.com` | `password123` | POS Billing, Prescriptions, Customer Records |
| **Staff** | `staff@medistock.com` | `password123` | View Inventory, Medicine Directory |
| **Supplier** | `supplier@medistock.com` | `password123` | Supplier Orders & Shipment Tracking Portal |

---

## ❓ Troubleshooting & FAQs

### 1. `Network Error` or `Failed to fetch`
* Ensure the backend Spring Boot server is running on `http://localhost:8081`.
* Check that `VITE_API_BASE_URL` in `.env` matches your backend URL.
* Verify CORS configuration in the backend (`SecurityConfig.java`).

### 2. `Login session expired or invalid token`
* Clear your browser's local storage (`localStorage.clear()`) and log in again.

### 3. Build issues with React 19
* If encountering dependency peer resolution warnings during `npm install`, use:
  ```bash
  npm install --legacy-peer-deps
  ```
