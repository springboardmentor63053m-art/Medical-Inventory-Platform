# MediStock — Medical Inventory Management Platform

A full-stack medical inventory management system for pharmacies, hospitals,
and clinics to manage medicines, suppliers, purchase orders, stock movements,
sales, expiry tracking, notifications, reports, and role-based dashboards.

**Stack:** React 19 + Vite · Spring Boot 3.3.2 / Java 17 · MySQL · JWT ·
OAuth2 Google Login · Docker · Render · Aiven Cloud MySQL

---

## 1. Live Application

| Service | URL |
|---|---|
| Frontend | https://medistock-frontend-ve4g.onrender.com/ |
| Backend API | https://medistock-backend-ov78.onrender.com/api |
| Health Check | https://medistock-backend-ov78.onrender.com/api/health |

### Production Architecture

```text
User Browser
     |
     v
React 19 + Vite Frontend
     |
     | HTTPS / REST API
     v
Spring Boot Backend
(Render + Docker)
     |
     | JDBC / MySQL
     v
Aiven Cloud MySQL
````

The frontend and backend are deployed separately on Render.

The production database is hosted on Aiven Cloud MySQL.

---

## 2. User Roles

MediStock provides four role-based accounts:

### Admin

Full system access including:

* Inventory management
* Category management
* Supplier management
* Purchase orders
* Sales
* Reports
* User management
* User activity monitoring
* Stock movement monitoring
* System settings
* Inventory health monitoring
* Supplier analytics

### Pharmacist

Access to:

* Medicines
* Categories
* Suppliers
* Purchases
* Sales
* Expiry information
* Inventory insights
* Relevant reports
* Inventory health information

### Staff

Access to:

* Medicines
* Suppliers
* Purchases
* Sales
* Low-stock information
* Personal purchase history
* Relevant reports

### Supplier

Supplier accounts are linked to an existing supplier record and provide
supplier-specific access to:

* Supplier dashboard
* Assigned supplier information
* Purchase orders
* Purchase-order responses
* Dispatch updates
* Relevant medicines and purchasing information

---

## 3. Account Creation and Authentication

Account creation is controlled by the backend.

### Public registration

```text
POST /api/auth/register
```

Public registration can create only:

* STAFF
* PHARMACIST

The backend validates the requested role and does not trust the frontend.

### Admin account

Admin accounts are not created through public registration.

The system maintains the Admin account through the application's controlled
administration process.

### Supplier accounts

Supplier accounts cannot be created through public registration.

An Admin creates a supplier login for an existing supplier:

```text
POST /api/admin/suppliers/{supplierId}/create-login
```

### Login

```text
POST /api/auth/login
```

Successful authentication returns a JWT which is used to access protected
endpoints.

### Logout

```text
POST /api/auth/logout
```

The application also tracks login activity and the user's last activity.

---

## 4. Authentication and Security Features

MediStock uses:

* JWT authentication
* BCrypt password hashing
* Spring Security
* Method-level authorization using `@PreAuthorize`
* Role-based access control
* Google OAuth2 login
* Password reset through email
* Protected REST APIs
* Session/activity tracking
* CORS configuration
* Production environment variables for secrets

Protected APIs require:

```text
Authorization: Bearer <JWT>
```

---

## 5. Forgot Password / Password Reset

MediStock supports password recovery through an emailed reset token.

### Request password reset

```text
POST /api/auth/forgot-password
```

The application intentionally provides a generic response so that the
existence of an account cannot be determined from the password-reset request.

### Reset password

```text
POST /api/auth/reset-password
```

The reset process uses a secure token with an expiry period.

Email delivery depends on the production email configuration.

Required production configuration includes:

```text
EMAIL_ALERTS_ENABLED
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_SMTP_AUTH
MAIL_SMTP_STARTTLS
```

If email delivery is disabled or incorrectly configured, the reset request
may be accepted by the backend but the user will not receive the reset email.

---

## 6. Google OAuth2 Login

Google OAuth2 login is implemented in the backend.

The current production deployment supports the OAuth2 configuration through:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

OAuth2 status can be checked using:

```text
GET /api/auth/oauth2-status
```

For production Google login, the following redirect URI must be registered
with Google Cloud:

```text
https://medistock-backend-ov78.onrender.com/login/oauth2/code/google
```

The production frontend uses the deployed Render backend rather than the
local development backend.

---

## 7. Core Features

### Authentication

* Registration
* Login
* Logout
* JWT authentication
* Role-based authorization
* BCrypt password hashing
* Google OAuth2 login
* Forgot password
* Password reset
* Profile management
* Change password
* Active-user tracking

### Medicine Inventory

* Add medicines
* Edit medicines
* Delete medicines
* Medicine categories
* Batch number tracking
* Quantity tracking
* Reorder-level tracking
* Expiry-date tracking
* Supplier association
* Search
* Filtering
* Low-stock detection
* Out-of-stock detection
* Near-expiry detection
* Expired-medicine detection
* Dead-stock detection
* Inventory health score
* Manual stock adjustment
* Stock removal
* Stock movement auditing

### Categories

* Create categories
* Update categories
* Delete categories
* View active categories
* View all categories

### Suppliers

* Supplier CRUD
* Supplier summary
* Supplier analytics
* Supplier-specific login
* Supplier purchase-order management

### Purchase Orders

MediStock uses a purchase-order lifecycle:

```text
PENDING
   |
   +----> REJECTED
   |
   v
ACCEPTED
   |
   v
DISPATCHED
   |
   v
RECEIVED
```

A purchase can also be:

```text
PENDING / ACCEPTED / DISPATCHED
        |
        v
    CANCELLED
```

Stock is increased only when the purchase order reaches:

```text
RECEIVED
```

This prevents stock from being incorrectly increased when an order is only
created or accepted.

### Sales

MediStock also supports sales/billing independently from purchases.

Features include:

* Record sales
* View sales
* View personal sales
* View individual sale details
* Sales analytics
* Recent-sales information
* Top-selling medicine information

### Notifications

Notifications can be generated for:

* Low stock
* Out of stock
* Near expiry
* Expired medicines
* Purchase events
* Daily inventory reminders

Notifications support:

* Unread count
* Mark one as read
* Mark all as read
* Scheduled alerts
* Event-triggered alerts

Optional notification channels include:

* Email
* SMS through Twilio
* Push notifications through Firebase

These optional channels can be independently enabled or disabled.

### Reports

CSV reports are available for:

* Inventory
* Expiry
* Purchases
* Sales
* Stock movements
* Analytics

The CSV files can be opened using applications such as:

* Microsoft Excel
* Google Sheets
* LibreOffice Calc

---

## 8. Dashboards

MediStock provides role-specific dashboards.

### Admin Dashboard

Includes:

* Inventory analytics
* Supplier analytics
* Purchase information
* Sales information
* Spend information
* Inventory health score
* System monitoring
* User activity
* Stock movement information

### Pharmacist Dashboard

Includes:

* Purchase summary
* Supply insights
* Supplier information
* Expiry information
* Inventory insights

### Staff Dashboard

Includes:

* Personal purchase information
* Low-stock information
* Purchase-related actions
* Sales-related information

### Supplier Dashboard

Includes supplier-specific:

* Purchase orders
* Order status
* Supplier information
* Purchasing information

---

## 9. Inventory Health and System Settings

MediStock provides an inventory health score based on inventory conditions.

The system also allows configurable inventory alert windows.

These include:

* Near-expiry window
* Dead-stock window

Relevant settings APIs:

```text
GET /api/settings
PUT /api/settings
```

Reading settings is available to:

```text
ADMIN
PHARMACIST
STAFF
```

Updating settings is restricted to:

```text
ADMIN
```

---

## 10. Stock Movement Audit

Every relevant stock change can be recorded in the stock movement history.

This provides an audit trail for:

* Stock additions
* Stock reductions
* Purchases
* Manual adjustments
* Stock removal

The Admin can review the complete stock movement history.

---

## 11. User Activity Monitoring

Admin users can monitor user activity.

The system records relevant information such as:

* User
* Action
* Timestamp
* Activity information

Admin endpoint:

```text
GET /api/admin/user-activity
```

Active-user information is also available through:

```text
GET /api/admin/active-users
```

---

## 12. Project Structure

```text
medistock/
│
├── backend/
│   ├── src/main/java/com/medistock/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   │
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-prod.properties
│   │
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── postman/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
└── README.md
```

---

## 13. Technology Stack

### Backend

* Java 17
* Spring Boot 3.3.2
* Spring Security
* Spring Data JPA
* Hibernate
* JWT
* OAuth2 Client
* JavaMailSender
* Maven
* MySQL Connector/J

### Frontend

* React 19
* Vite
* React Router
* Axios
* Tailwind CSS
* Recharts
* Lucide React

### Database

Local development:

```text
MySQL 8
```

Production:

```text
Aiven Cloud MySQL
```

### Deployment

* Docker
* Render

### Development and Testing

* Git
* GitHub
* GitHub Actions
* Postman
* Maven tests
* Vitest / React Testing Library

---

## 14. Local Development

### Prerequisites

Install:

| Tool    | Version       |
| ------- | ------------- |
| Java    | 17+           |
| Maven   | 3.8+          |
| Node.js | 18+           |
| npm     | 9+            |
| MySQL   | 8+            |
| Git     | Latest stable |
| Docker  | Optional      |

---

### Create Local Database

Open MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS medistock_db;
```

Configure the local database credentials in:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medistock_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

---

### Run Backend Locally

```bash
cd backend
mvn clean package
mvn spring-boot:run
```

The local backend runs at:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/api/health
```

---

### Run Frontend Locally

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs at:

```text
http://localhost:5173
```

For local development, configure:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Local URLs are used only for development.

They are not the production URLs.

---

## 15. Production Environment

The production backend uses the Spring Boot `prod` profile.

Production database:

```text
Aiven Cloud MySQL
```

Production schema validation:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

This means Hibernate validates the existing production schema rather than
automatically modifying the production database schema.

### Production environment variables

The following variables are configured on Render and should never be
hard-coded into the source code:

```text
DB_URL
DB_USERNAME
DB_PASSWORD

JWT_SECRET
JWT_EXPIRATION_MS

FRONTEND_URL
CORS_ALLOWED_ORIGINS

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

EMAIL_ALERTS_ENABLED
EMAIL_ALERTS_RECIPIENTS

MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_SMTP_AUTH
MAIL_SMTP_STARTTLS

SMS_ALERTS_ENABLED
PUSH_ALERTS_ENABLED

DEMO_DATA_ENABLED
```

Production demo data is disabled:

```text
DEMO_DATA_ENABLED=false
```

The backend receives the Render-provided `PORT` environment variable.

Therefore the application uses:

```properties
server.port=${PORT:8080}
```

---

## 16. Production Deployment

The project is deployed using Docker and Render.

### Backend

The backend uses a multi-stage Docker build:

```text
Maven + Java 17
       |
       v
Build Spring Boot JAR
       |
       v
Java 17 Runtime Container
```

### Frontend

The frontend uses a Docker build process:

```text
Node.js
   |
   v
npm build
   |
   v
Nginx
```

### Deployment flow

```text
GitHub
   |
   +--------------------+
   |                    |
   v                    v
Render Backend      Render Frontend
Docker              Docker/Nginx
   |                    |
   |                    |
   +-------- HTTPS -----+
            |
            v
       Aiven MySQL
```

---

## 17. Production URLs

### Frontend

```text
https://medistock-frontend-ve4g.onrender.com/
```

### Backend

```text
https://medistock-backend-ov78.onrender.com/api
```

### Health Check

```text
https://medistock-backend-ov78.onrender.com/api/health
```

### OAuth2 Callback

```text
https://medistock-backend-ov78.onrender.com/login/oauth2/code/google
```

---

## 18. API Reference

All REST APIs use the `/api` prefix.

Protected endpoints require:

```text
Authorization: Bearer <JWT>
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/oauth2-status
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/health
```

### Medicines

```text
GET    /api/medicines
GET    /api/medicines/{id}
GET    /api/medicines/low-stock
GET    /api/medicines/out-of-stock
GET    /api/medicines/near-expiry
GET    /api/medicines/expired
POST   /api/medicines
PUT    /api/medicines/{id}
PATCH  /api/medicines/{id}/adjust-stock
PATCH  /api/medicines/{id}/remove-stock
DELETE /api/medicines/{id}
```

### Categories

```text
GET    /api/categories
GET    /api/categories/all
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### Suppliers

```text
GET    /api/suppliers
GET    /api/suppliers/summary
GET    /api/suppliers/{id}
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}
```

### Purchases

```text
GET   /api/purchases
GET   /api/purchases/mine
POST  /api/purchases
PATCH /api/purchases/{id}/respond
PATCH /api/purchases/{id}/dispatch
PATCH /api/purchases/{id}/receive
PATCH /api/purchases/{id}/cancel
```

### Sales

```text
GET  /api/sales
GET  /api/sales/mine
GET  /api/sales/{id}
POST /api/sales
GET  /api/sales/analytics
```

### Stock Movements

```text
GET /api/stock-movements
GET /api/stock-movements/medicine/{id}
```

### Notifications

```text
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all
```

### Dashboards

```text
GET /api/dashboard/stats
GET /api/dashboard/admin
GET /api/dashboard/pharmacist
GET /api/dashboard/staff
GET /api/dashboard/supplier
GET /api/dashboard/inventory-health
```

### Reports

```text
GET /api/reports/inventory
GET /api/reports/expiry
GET /api/reports/purchases
GET /api/reports/sales
GET /api/reports/stock-movements
GET /api/reports/analytics
```

### Admin

```text
GET   /api/admin/user-activity
GET   /api/admin/active-users
GET   /api/admin/users
POST  /api/admin/suppliers/{supplierId}/create-login
PATCH /api/admin/users/{id}/activate
PATCH /api/admin/users/{id}/deactivate
PATCH /api/admin/users/{id}/role
```

### Profile

```text
GET  /api/profile
PUT  /api/profile
POST /api/profile/change-password
```

### Settings

```text
GET /api/settings
PUT /api/settings
```

---

## 19. Testing

### Backend Tests

Run:

```bash
cd backend
mvn test
```

### Frontend Tests

Run:

```bash
cd frontend
npm test
```

### API Testing

The project includes Postman testing resources under:

```text
postman/
```

Protected API requests require a valid JWT.

Typical testing flow:

```text
Register/Login
     |
     v
Obtain JWT
     |
     v
Set Bearer Token
     |
     v
Test protected APIs
```

### CI

GitHub Actions is configured to build and test the project on pushes and
pull requests.

Workflow:

```text
.github/workflows/ci.yml
```

---

## 20. Docker

Docker files are included for both backend and frontend.

### Run complete local stack

```bash
docker-compose up --build
```

This can run:

```text
MySQL
Backend
Frontend
```

Docker is optional for normal local development.

The project can also be run directly using:

```text
Maven
+
npm
+
MySQL
```

---

## 21. Security

Production secrets must never be committed to GitHub.

Never commit:

```text
DB_PASSWORD
JWT_SECRET
GOOGLE_CLIENT_SECRET
MAIL_PASSWORD
TWILIO_AUTH_TOKEN
FIREBASE credentials
.env files containing real secrets
```

Production secrets should be stored only in the deployment platform's
environment-variable configuration.

If a secret is accidentally exposed:

1. Revoke the exposed credential.
2. Generate a new credential.
3. Update the deployment environment variable.
4. Redeploy the affected service.

---

## 22. Local vs Production

| Feature       | Local Development                   | Production                                        |
| ------------- | ----------------------------------- | ------------------------------------------------- |
| Frontend      | Vite                                | Render                                            |
| Backend       | Spring Boot                         | Render + Docker                                   |
| Database      | Local MySQL                         | Aiven Cloud MySQL                                 |
| API           | `http://localhost:8080/api`         | `https://medistock-backend-ov78.onrender.com/api` |
| Frontend      | `http://localhost:5173`             | `https://medistock-frontend-ve4g.onrender.com/`   |
| Schema        | Hibernate development configuration | `ddl-auto=validate`                               |
| Demo data     | Configurable                        | Disabled                                          |
| HTTPS         | Development may use HTTP            | Enabled                                           |
| CORS          | Local frontend origin               | Render frontend origin                            |
| Google OAuth2 | Requires credentials                | Requires production credentials and callback      |
| Email         | Depends on local configuration      | Depends on Render mail configuration              |

---

## 23. Important Production Notes

### Render

The backend listens on the port supplied by Render:

```text
${PORT:8080}
```

Render may therefore show the application running on a port such as:

```text
10000
```

This is expected.

The public URL remains:

```text
https://medistock-backend-ov78.onrender.com
```

### Aiven

Production database connectivity uses:

```text
Aiven Cloud MySQL
```

The production database URL, username, and password are supplied through
environment variables.

### CORS

The production backend must allow the deployed frontend origin:

```text
https://medistock-frontend-ve4g.onrender.com
```

This is controlled through:

```text
CORS_ALLOWED_ORIGINS
```

### Frontend API

The deployed frontend must use the production backend API:

```text
https://medistock-backend-ov78.onrender.com/api
```

It must not use:

```text
http://localhost:8080/api
```

for the live deployment.

---

## 24. Current Production Architecture

```text
                         ┌─────────────────────────┐
                         │        User Browser     │
                         └────────────┬────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                    ┌───────────────────────────────┐
                    │     Render Frontend           │
                    │ React 19 + Vite + Nginx       │
                    │                               │
                    │ medistock-frontend-ve4g       │
                    └───────────────┬───────────────┘
                                    │
                                    │ REST API / HTTPS
                                    ▼
                    ┌───────────────────────────────┐
                    │      Render Backend            │
                    │ Spring Boot 3.3.2             │
                    │ Java 17 + Docker               │
                    │ JWT + Spring Security         │
                    │ OAuth2 + JavaMail              │
                    │                               │
                    │ medistock-backend-ov78         │
                    └───────────────┬───────────────┘
                                    │
                                    │ JDBC / MySQL
                                    ▼
                    ┌───────────────────────────────┐
                    │       Aiven Cloud MySQL        │
                    │                               │
                    │ Production Database            │
                    └───────────────────────────────┘
```

---

## 25. Complete Application Workflow

```text
User
 |
 v
Authentication
 |
 +----------------------+
 |                      |
 v                      v
JWT Login          Google OAuth2
 |
 v
Role-Based Dashboard
 |
 +----------+----------+-----------+
 |          |          |           |
 v          v          v           v
Admin   Pharmacist   Staff      Supplier
 |
 v
Inventory
 |
 +-------------------+
 |                   |
 v                   v
Medicines         Categories
 |
 v
Suppliers
 |
 v
Purchase Orders
 |
 v
Supplier Response
 |
 v
Dispatch
 |
 v
Receive
 |
 v
Stock Updated
 |
 v
Stock Movement Audit
 |
 +----------------------+
 |                      |
 v                      v
Expiry / Stock Alerts   Sales
 |                      |
 v                      v
Notifications        Sales Analytics
 |
 v
Reports
```

---

## 26. Project Highlights

MediStock combines inventory management with operational monitoring rather
than treating medicine records as simple CRUD data.

Key system capabilities include:

* Four role-based dashboards
* Secure JWT authentication
* BCrypt password hashing
* Google OAuth2 integration
* Password recovery
* Medicine and category management
* Supplier management
* Supplier-specific accounts
* Purchase-order workflow
* Stock updates only after purchase receipt
* Sales and billing
* Stock movement audit trail
* User activity monitoring
* Inventory health scoring
* Configurable expiry and dead-stock windows
* Automated notifications
* CSV reporting
* Production deployment using Docker and Render
* Cloud MySQL database through Aiven
* GitHub Actions CI
* Postman API testing

---

## 27. Production Status

The MediStock application is deployed using:

```text
Frontend  → Render
Backend   → Render + Docker
Database  → Aiven Cloud MySQL
Source    → GitHub
CI        → GitHub Actions
Testing   → Postman + Maven + Frontend Tests
```

Live frontend:

```text
https://medistock-frontend-ve4g.onrender.com/
```

Live backend:

```text
https://medistock-backend-ov78.onrender.com/api
```

Health check:

```text
https://medistock-backend-ov78.onrender.com/api/health
```

---

## 28. Summary

MediStock is a full-stack medical inventory management platform built around
secure role-based access, real inventory workflows, supplier management,
purchase orders, sales, stock auditing, notifications, reporting, and
inventory analytics.

The production architecture is:

```text
React 19
   ↓
Render Frontend
   ↓ HTTPS
Spring Boot 3.3.2
   ↓
Render + Docker
   ↓ JDBC / MySQL
Aiven Cloud MySQL
```

The system supports four roles:

```text
ADMIN
PHARMACIST
STAFF
SUPPLIER
```

The main operational workflow is:

```
Authentication
      ↓
Role-Based Dashboard
      ↓
Inventory / Suppliers
      ↓
Purchase Orders
      ↓
Supplier Processing
      ↓
Receipt
      ↓
Stock Update
      ↓
Stock Audit
      ↓
Notifications
      ↓
Sales / Analytics
      ↓
Reports
```

MediStock is designed as a production-deployed, role-based medical inventory
management platform with cloud hosting, database persistence, API security,
automated monitoring, and reporting.
