# Medical Inventory Management Platform — MediStock Pro
## Week 2 — Academic Documentation
### B.Tech Final Year Project | Infosys Springboard Internship | Computer Science Engineering

---

# 1. Week 2 Overview

## 1.1 Objectives for Week 2

Week 2 focused on complete **frontend development** of all React pages, **API integration** with Spring Boot, and delivery of a fully functional production-ready application. All 9 core modules were implemented with CRUD, real-time data binding, and a premium glassmorphism dark/light mode UI.

| # | Week 2 Goal |
|---|-------------|
| G1 | Build all 13 React pages connected to the backend REST API |
| G2 | Implement premium dark/light animated UI with TailwindCSS |
| G3 | Connect Recharts analytics to live dashboard API data |
| G4 | Deliver role-based UI rendering on all pages |
| G5 | Implement export functionality in Reports module |
| G6 | Add Command Palette (Ctrl+K) for keyboard navigation |
| G7 | Implement Alerts module with acknowledge/resolve workflow |
| G8 | Add stock movement audit trail view |
| G9 | Complete Docker containerization and production build |

---

# 2. Modules Developed

## 2.1 Authentication Module (Module 1)

- Login page with split-panel design and role quick-login cards
- JWT Token Flow: stored in localStorage, attached via Axios interceptor
- Auto-logout on 401 (expired/invalid token)
- Register page with role selection
- Password Reset modal trigger

## 2.2 Dashboard Module (Module 2)

- Admin + Pharmacist view switcher per PDF specification
- KPI Cards: Total Medicines, Inventory Value, Low Stock Count, Active Alerts
- Monthly Revenue AreaChart (Recharts) — 12-month trend
- Top Medicines Bar Chart
- Recent Purchases + Recent Sales feed (last 5 each)

## 2.3 Medicine Management Module (Module 3)

- Full CRUD: Create, Read, Update, Delete medicines
- Search by name, generic name, brand name
- Filter by Category, Supplier, Stock Status
- Add/Edit modal with all fields: name, generic name, brand, category, supplier, unit, HSN code, description, unit price, MRP, reorder level

## 2.4 Inventory Management Module (Module 4)

- All Inventory, Low Stock, Expiring Soon tabs
- Batch number, quantity, expiry date, location tracking
- Stock Adjustment modal with reason
- Colour-coded expiry: Red (< 30 days), Yellow (30-60), Green (safe)

## 2.5 Supplier Management Module (Module 5)

- Supplier profiles with GST number, license number, contact details
- Full CRUD: Create, Edit, Delete suppliers
- Performance tracking: star rating, on-time delivery %
- Linked medicines view

## 2.6 Purchase Management Module (Module 6)

- Create purchase orders with multi-item line items
- PENDING ? RECEIVED / CANCELLED workflow
- Receive: auto stock-in + StockMovement(PURCHASE_IN) logged
- Expandable rows show purchase items inline

## 2.7 Sales Management Module (Module 7)

- Multi-item sales with medicine selector (auto-fills MRP)
- Payment methods: CASH, CARD, UPI, INSURANCE
- Auto stock-out on sale creation
- Cancel sale: restores inventory quantities
- Blocks sale if insufficient stock

## 2.8 Alert Center Module (Module 8)

- Active Alerts + All Alerts tabs
- Alert types: LOW_STOCK, EXPIRY_30_DAYS, EXPIRY_60_DAYS, EXPIRY_90_DAYS
- Acknowledge / Resolve workflow
- Navbar bell badge shows active alert count

## 2.9 Reports & Analytics Module (Module 9)

Five report types:
1. Inventory Valuation Report
2. Purchase Order History
3. Expiry Risk Report
4. Sales Performance Report
5. Stock Movement Log

Plus: Export PDF (browser print), Export CSV download, Date range filters

## 2.10 Employee Management Module (Module 10)

- Employee card grid with avatar initial
- Full CRUD (Admin only)
- ACTIVE / INACTIVE status management
- Linked to user accounts

---

# 3. UI/UX Design System

## 3.1 Design Highlights

- **Color**: Deep navy dark (`#0a0f1c`) + crisp white light mode
- **Typography**: Inter (body) + Outfit (display) from Google Fonts
- **Glassmorphism**: Cards with `backdrop-filter: blur()` + border-white/10
- **Theme Toggle**: Animated 3-option pill (Light / Dark / Auto)
- **Micro-animations**: Hover effects, scale transforms, smooth transitions
- **Command Palette**: Ctrl+K keyboard navigation overlay

## 3.2 Responsive Layout

| Breakpoint | Sidebar Behavior |
|------------|-----------------|
| < 768px | Drawer overlay (hamburger) |
| 768-1024px | Collapsed icon-only sidebar |
| > 1024px | Full expanded sidebar |

---

# 4. Full-Stack Integration Highlights

## 4.1 JWT Auth Flow
```
Login ? POST /api/auth/login ? JWT returned ? localStorage
? Axios interceptor: Authorization: Bearer <token>
? JwtAuthFilter validates ? SecurityContext set
? 401 response ? logout + redirect to /login
```

## 4.2 Purchase ? Auto Stock-In
```
Mark RECEIVED ? PurchaseService
? For each PurchaseItem: inventory.qty += item.qty
? StockMovement(PURCHASE_IN) logged
? Dashboard KPIs refresh
```

## 4.3 Sale ? Auto Stock-Out
```
Create Sale ? SalesService
? Check: inventory.qty >= item.qty (else 400 error)
? inventory.qty -= item.qty
? StockMovement(SALE_OUT) logged
? qty < reorderLevel ? LOW_STOCK alert auto-created
```

## 4.4 Scheduled Alert Engine
```
@Scheduled(cron = "0 0 6 * * ?")  // Daily at 6 AM
? qty < reorderLevel  ? LOW_STOCK alert
? expiry = 30 days    ? EXPIRY_30_DAYS alert
? expiry = 60 days    ? EXPIRY_60_DAYS alert
? expiry = 90 days    ? EXPIRY_90_DAYS alert
```

---

# 5. Data Seeded (DataInitializer.java)

| Data | Count | Sample |
|------|-------|--------|
| Roles | 4 | ADMIN, PHARMACIST, INVENTORY_MANAGER, STAFF |
| Users | 5 | admin, dr_patel, ravi_inv, priya_staff, sneha_ph |
| Employees | 5 | Arjun Sharma, Rajesh Patel, Ravi Kumar, Priya Nair, Sneha Reddy |
| Categories | 10 | Antibiotics, Analgesics, Vitamins & Minerals, etc. |
| Suppliers | 10 | Sun Pharma, Cipla, Dr. Reddy's, Mankind, Lupin, etc. |
| Medicines | 10 | Amoxicillin, Paracetamol, Atorvastatin, Metformin, etc. |
| Inventory | 10 | Batch records with expiry dates and shelf locations |
| Purchase Orders | 8 | INV-2024-0001 to INV-2024-0008 |
| Sales | 10 | SALE-2024-0001 to SALE-2024-0010 |
| Stock Movements | 12 | PURCHASE_IN, SALE_OUT, ADJUSTMENT_IN, EXPIRED_REMOVAL |
| Alerts | 6 | LOW_STOCK (3), EXPIRY_30_DAYS (3) |

---

# 6. Week 2 Deliverables Summary

| Deliverable | Status |
|-------------|--------|
| 13 React Pages (all modules) | ? Complete |
| Dark/Light Mode animated toggle | ? Complete |
| Dashboard with live Recharts | ? Complete |
| Medicine CRUD + search/filter | ? Complete |
| Inventory tabs + stock adjustment | ? Complete |
| Supplier management | ? Complete |
| Purchase orders + receive workflow | ? Complete |
| Sales + multi-item cart | ? Complete |
| Alert center + acknowledge/resolve | ? Complete |
| 5 Report types + PDF/CSV export | ? Complete |
| Employee management (RBAC) | ? Complete |
| Command Palette (Ctrl+K) | ? Complete |
| Docker Compose 3 services | ? Complete |
| README + Docs updated | ? Complete |

---

*MediStock Pro — Week 2 Documentation | Infosys Springboard Internship | B.Tech CSE*
