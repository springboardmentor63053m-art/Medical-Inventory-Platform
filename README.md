# 🏥 MediStock - Medical Inventory Management Platform

![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)
![Neon DB](https://img.shields.io/badge/Cloud%20DB-Neon-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 📝 Overview

**MediStock** is an enterprise medical inventory platform built to streamline pharmaceutical stock tracking, POS billing sales, low-stock/expiry monitoring, purchase orders, supplier portals, internal team chat, and role-based access control (RBAC).

Developed as a group project for the **Infosys Springboard Internship**.

---

## 💻 Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | ☕ Java 17, Spring Boot 3.2.5, Spring Security, JJWT (0.12.5), Spring Data JPA |
| **Frontend** | ⚛️ React 18, Vite 5, Axios, Lucide Icons, Vanilla CSS |
| **Database** | 🐘 Local PostgreSQL & Serverless Neon Cloud DB |
| **Deployment & DevOps** | ☁️ Neon DB (Database), Render / Railway / Vercel (Hosting), 🐳 Docker |

---

## ✨ Key Features

- 🔐 **Security & RBAC**: Stateless JWT auth with role enforcement for Admin, Pharmacist, Staff, and Supplier.
- 📦 **Inventory Management**: Real-time batch, threshold, pricing, and stock level tracking.
- ⚠️ **Expiry Monitoring**: Automated alerts for medicines nearing expiration (30-day window).
- 🛒 **POS Billing System**: Quick checkout interface, invoice generation, tax/discount calculation, and stock deduction.
- 🚚 **Procurement & Supplier Portal**: Purchase order workflows (`DRAFT` → `SENT` → `RECEIVED`) and supplier portal views.
- 💬 **Messaging & AI Assistant**: Internal staff chat interface and AI assistant integration (`/api/chat-messages`).
- 📊 **Analytics**: Interactive dashboards showing revenue metrics, stock valuation, and trend reports.

---

## 👥 User Roles Matrix

| Role | Role Key | Permissions & Access Scope |
| --- | --- | --- |
| **👑 Admin** | `ROLE_ADMIN` | Full control: user management, global settings, financial reports, categories. |
| **💊 Pharmacist** | `ROLE_PHARMACIST` | Operations: stock entries, POS billing, purchase orders, low-stock alerts. |
| **📋 Staff** | `ROLE_STAFF` | General support: stock lookup, sales assistance, movement logs, notifications. |
| **🚚 Supplier** | `ROLE_SUPPLIER` | External portal: view assigned purchase orders, update fulfillment statuses. |

---

## 📂 Project Structure

```text
Medical-Inventory-Platform/
├── Database/               # PostgreSQL schema & seed script (Medistock_postgres.sql)
├── docs/                   # Week 1 project design deliverables (.docx)
├── medistock-backend/      # Spring Boot application & Dockerfile
└── medistock-frontend/     # React + Vite client application
```

---

## 💻 Quickstart (Local)

1. **Database**: Create PostgreSQL DB `medistock_db` & run `Database/Medistock_postgres.sql`.
2. **Backend**:
   ```bash
   cd medistock-backend && ./mvnw spring-boot:run
   ```
3. **Frontend**:
   ```bash
   cd medistock-frontend && npm install && npm run dev
   ```

---

## ☁️ Cloud Deployment

- **Database (Neon DB)**: Import `Database/Medistock_postgres.sql` into **[Neon DB](https://neon.tech/)**.
- **Backend (Render / Railway / Docker)**: Set environment variables:
  - `DB_URL` = `jdbc:postgresql://<neon-host>/<dbname>?sslmode=require`
  - `DB_USERNAME` = `<neon-user>` | `DB_PASSWORD` = `<neon-password>`
- **Frontend (Vercel / Netlify)**:
  - Build: `npm run build` | Output: `dist`
  - ENV: `VITE_API_BASE_URL=https://<your-backend-domain>/api`

---

## ⚖️ License
Developed for the **Infosys Springboard Internship Program**.
