# MediStock — Medical Inventory Management Platform

A full-stack web app for pharmacies, hospitals, and clinics to manage medicine
inventory, track expiry dates, monitor stock levels, and maintain supplier
records — built with **React.js** (frontend) and **Spring Boot** (backend).

This is a ready-to-run implementation of the core MediStock modules, with
**three separate role-based dashboards** (Admin, Pharmacist, Staff):

- JWT authentication with role-based accounts (Admin / Pharmacist / Staff)
- Medicine inventory management (add / edit / delete, batch numbers, categories)
- Supplier management
- Real-time stock tracking with low-stock and out-of-stock detection
- Expiry tracking (near-expiry + expired medicine detection)
- Search & filter by name, category, supplier
- **Purchases**: record restocks from suppliers — automatically updates
  stock, logs a stock movement, and fires a purchase-alert notification
- **Stock movement report** (Admin): full audit trail of every stock change
- **User activity log** (Admin): who did what, and when
- **Supplier analytics** (Admin): spend-by-supplier chart from real purchase data
- **System monitoring** (Admin): live system status + server time
- **Notifications**: in-app alert center (bell icon) covering low stock,
  out of stock, expiry, purchases, and a daily inventory reminder —
  generated automatically by a scheduled job, and instantly on manual
  stock/purchase actions
- **Reports**: role-gated CSV downloads — inventory, expiry, purchase
  history, and stock movement reports (opens cleanly in Excel/Sheets)
- **Role-specific dashboards**:
  - **Admin** — inventory analytics, supplier analytics, purchases &
    spend, system monitoring, links to user activity / stock movements / reports
  - **Pharmacist** — purchase summary, supply insight (top suppliers by
    spend), expiry report
  - **Staff** — their own purchase history, quick low-stock check, link
    to record a new purchase

No Docker required — everything runs directly with Maven and npm.

---

## 1. Project structure

```
medistock/
├── backend/                  Spring Boot API (Java 17, Maven)
│   ├── src/main/java/com/medistock/
│   │   ├── config/            Security & CORS configuration
│   │   ├── security/          JWT filter, JWT util, auth entry point
│   │   ├── model/              JPA entities (User, Medicine, Supplier, Role)
│   │   ├── repository/         Spring Data JPA repositories
│   │   ├── dto/                 Request/response DTOs
│   │   ├── service/             Business logic
│   │   ├── controller/          REST controllers
│   │   └── exception/           Global exception handling
│   ├── src/main/resources/
│   │   ├── application.properties        (MySQL, local dev)
│   │   └── application-prod.properties   (PostgreSQL, production)
│   └── pom.xml
│
├── frontend/                 React 19 + Vite + Tailwind CSS v4
│   └── src/
│       ├── api/                axios client with JWT interceptor
│       ├── context/            AuthContext (login/register/logout)
│       ├── components/         Sidebar, modals, status pills, etc.
│       └── pages/               Login, Register, Dashboard, Medicines, Suppliers
│
├── database/
│   ├── schema.sql             Manual reference schema (tables auto-created by Hibernate too)
│   └── seed.sql                Sample suppliers & medicines
│
└── README.md                  You are here
```

---

## 2. Prerequisites

Install these before you start:

| Tool | Version | Check with |
|---|---|---|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| MySQL | 8.x | `mysql --version` |

Download links if you need them:
- Java: https://adoptium.net/
- Maven: https://maven.apache.org/download.cgi
- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/mysql/

---

## 3. Step-by-step setup

### Step 1 — Create the MySQL database

Open a terminal and log into MySQL:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE IF NOT EXISTS medistock_db;
EXIT;
```

That's it — Hibernate will auto-create all tables the first time the backend
starts (`spring.jpa.hibernate.ddl-auto=update`). You don't need to run
`schema.sql` manually, but it's there for reference or if you prefer to
manage migrations yourself.

**Optional:** load sample data after the backend has started once (so the
tables exist):

```bash
mysql -u root -p medistock_db < database/seed.sql
```

### Step 2 — Configure the backend

Open `backend/src/main/resources/application.properties` and update the
MySQL username/password if they differ from the defaults:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

### Step 3 — Run the backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will start on **http://localhost:8080**.

Verify it's alive:

```bash
curl http://localhost:8080/api/health
# {"status":"UP","service":"MediStock API"}
```

### Step 4 — Run the frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

The app will start on **http://localhost:5173**.

The frontend already points to `http://localhost:8080/api` by default. If
you need to change it, copy `.env.example` to `.env` and edit
`VITE_API_BASE_URL`.

### Step 5 — Create accounts for each role

Register three accounts (one per role) so you can see all three dashboards:

1. Open http://localhost:5173 → **Create an account**
2. Create `admin@medistock.com` with role **Admin**
3. Log out, create `pharmacist@medistock.com` with role **Pharmacist**
4. Log out, create `staff@medistock.com` with role **Staff**

Each account is automatically routed to its own dashboard on login:

| Role | Lands on | Sidebar links |
|---|---|---|
| Admin | `/admin/dashboard` | Dashboard, Medicines, Purchases, Suppliers, Reports, User activity, Stock movements |
| Pharmacist | `/pharmacist/dashboard` | Dashboard, Medicines, Purchases, Suppliers, Reports |
| Staff | `/staff/dashboard` | Dashboard, Medicines, Purchases, Suppliers, Reports |

Admin can also view the Pharmacist/Staff dashboards directly (e.g.
`/pharmacist/dashboard`) since Admin has access to every role's views.

### Step 6 — Add suppliers and medicines

- Go to **Suppliers** → **Add supplier** to create a supplier record
- Go to **Medicines** → **Add medicine** to add stock, linking it to a
  supplier, setting quantity, reorder level, batch number, and expiry date
- Use the **+ / −** buttons in the Medicines table for quick manual stock
  adjustments (these are logged and can trigger low-stock alerts)

### Step 7 — Record a purchase

Go to **Purchases** → **Record purchase**, pick a medicine, quantity, and
unit price. This:
1. Increases the medicine's stock
2. Adds an entry to the stock movement audit trail
3. Fires a "New purchase recorded" notification (bell icon, top of sidebar)

### Step 8 — Check notifications & reports

- The **bell icon** in the sidebar shows live alerts: low stock, out of
  stock, expiry warnings, purchase alerts, and a daily inventory reminder.
  It polls every 30 seconds and shows an unread badge.
- A scheduled job (`AlertScheduler`) also runs once a day (07:00 server
  time) and once ~30 seconds after the backend starts, so you'll see alerts
  populate shortly after your first run — no need to wait a full day.
- Go to **Reports** to download CSV reports. Which reports you see depends
  on your role (Admin sees all four; Pharmacist sees expiry + purchases;
  Staff sees purchases).

---

## 4. API reference (quick overview)

All endpoints are prefixed with `/api`. Endpoints other than `/api/auth/**`
and `/api/health` require a `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns JWT |
| POST | `/auth/login` | Log in, returns JWT |
| GET | `/medicines` | List all medicines (supports `?name=` / `?category=`) |
| GET | `/medicines/{id}` | Get one medicine |
| GET | `/medicines/low-stock` | Medicines at/below reorder level |
| GET | `/medicines/out-of-stock` | Medicines with zero quantity |
| GET | `/medicines/near-expiry?days=30` | Medicines expiring soon |
| GET | `/medicines/expired` | Already-expired medicines |
| POST | `/medicines` | Create a medicine |
| PUT | `/medicines/{id}` | Update a medicine |
| PATCH | `/medicines/{id}/adjust-stock` | Body: `{ "delta": 1 }` or `{ "delta": -1 }` |
| DELETE | `/medicines/{id}` | Delete a medicine |
| GET | `/suppliers` | List all suppliers |
| POST | `/suppliers` | Create a supplier |
| PUT | `/suppliers/{id}` | Update a supplier |
| DELETE | `/suppliers/{id}` | Delete a supplier |
| GET | `/dashboard/stats` | Generic aggregate stats |
| GET | `/dashboard/admin` | **Admin only** — full analytics + supplier insights + system status |
| GET | `/dashboard/pharmacist` | **Admin/Pharmacist** — purchase summary, supply insight, expiry list |
| GET | `/dashboard/staff` | **Admin/Staff** — the caller's own purchase history |
| GET | `/purchases` | All purchases, newest first |
| GET | `/purchases/mine` | Purchases recorded by the current user |
| POST | `/purchases` | Record a purchase — body: `{ medicineId, supplierId, quantity, unitPrice, note }` |
| GET | `/stock-movements` | Full stock movement audit trail |
| GET | `/stock-movements/medicine/{id}` | Movement history for one medicine |
| GET | `/notifications` | Notifications for the current user's role |
| GET | `/notifications/unread-count` | `{ "count": n }` |
| PATCH | `/notifications/{id}/read` | Mark one notification read |
| PATCH | `/notifications/read-all` | Mark all (for the current role) read |
| GET | `/admin/user-activity` | **Admin only** — full user activity log |
| GET | `/reports/inventory` | **Admin only** — CSV |
| GET | `/reports/expiry` | **Admin/Pharmacist** — CSV |
| GET | `/reports/purchases` | **Admin/Staff/Pharmacist** — CSV |
| GET | `/reports/stock-movements` | **Admin only** — CSV |

---

## 5. Switching to PostgreSQL for production

The backend ships with a `prod` profile pre-wired for PostgreSQL. To use it:

```bash
export DB_URL=jdbc:postgresql://<host>:5432/medistock_db
export DB_USERNAME=<your-username>
export DB_PASSWORD=<your-password>
export JWT_SECRET=<a-long-random-secret>

mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

No Docker needed — deploy the backend as a standard Spring Boot JAR
(`mvn clean package` → `java -jar target/medistock-backend-1.0.0.jar`) and the
frontend as a static build (`npm run build` → deploy the `dist/` folder to
any static host).

---

## 6. Tech stack (matches the original spec)

**Backend:** Java, Spring Boot, Spring Security, Spring Data JPA, Hibernate,
JWT (jjwt), Maven, MySQL (dev) / PostgreSQL (prod)

**Frontend:** React.js, React Router, Axios, Tailwind CSS, Recharts,
lucide-react icons

---

## 7. What's included vs. what to extend next

This build implements the core, demo-ready system end-to-end: auth, medicine
inventory, suppliers, stock/expiry tracking, search & filter, and dashboard
analytics — all working together against a real database.

Not yet wired up (natural next steps, following the same patterns already in
the codebase):
- OAuth2 Google login (JWT auth is fully implemented; OAuth2 needs your own
  Google API credentials)
- **Real push notifications** — the current system is a polling, in-app
  notification center (bell icon). True browser/mobile push would need a
  service worker + Web Push API or Firebase Cloud Messaging on top of the
  same `Notification` entity/service that already exists.
- **PDF report export** — reports currently generate as CSV (zero extra
  dependencies, opens in Excel/Sheets). Swapping to PDF just means adding a
  PDF library (e.g. OpenPDF) inside `ReportService` and keeping the same
  controller endpoints.
- Admin user-management screen (roles are already enforced server-side —
  this would just be the UI for managing them)

Each of these follows the same layered structure (entity → repository →
service → controller / component → page), so they're a natural continuation
rather than a redesign.
