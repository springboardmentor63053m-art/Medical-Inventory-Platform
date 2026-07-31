# Medical Inventory Management Platform
## Week 1 — Academic Documentation
### B.Tech Final Year Project | Computer Science Engineering

---

# 1. Project Understanding and Objectives

## 1.1 Project Overview

The **Medical Inventory Management Platform (MIMP)** is an enterprise-level web-based application developed to automate, streamline, and optimize the management of medical inventory in hospitals, clinics, and pharmacies. The platform replaces error-prone manual processes with a secure, scalable, and real-time digital solution that covers every aspect of medical supply chain management.

## 1.2 Project Objectives

| # | Objective |
|---|-----------|
| O1 | Develop a secure role-based authentication system with JWT tokens |
| O2 | Implement comprehensive medicine and category management |
| O3 | Track real-time inventory levels with automatic low-stock and expiry alerts |
| O4 | Manage purchase orders from suppliers and integrate them into stock |
| O5 | Record and track medicine sales with automatic stock deduction |
| O6 | Generate detailed analytical reports and dashboard KPIs |
| O7 | Maintain audit trails through stock movement logs |
| O8 | Support multi-role access for Administrators, Pharmacists, Inventory Managers, and Staff |
| O9 | Provide a responsive, modern UI accessible across desktop and tablet devices |
| O10 | Deliver a containerized application ready for deployment |

## 1.3 Expected Outcomes

- **Reduced stock-outs**: Automated alerts ensure timely reordering before stock falls below threshold.
- **Zero expired medicine distribution**: Expiry tracking prevents dispensing of expired medicines.
- **Accurate inventory**: Real-time stock updates after every purchase and sale transaction.
- **Improved compliance**: Audit logs satisfy regulatory requirements for medical facilities.
- **Faster decision-making**: Dashboard analytics and visual reports enable data-driven decisions.
- **Reduced operational costs**: Eliminating manual record-keeping reduces labor and error costs.

## 1.4 Stakeholders

| Stakeholder | Role in System |
|-------------|----------------|
| Hospital/Pharmacy Management | Primary decision-makers; view reports and analytics |
| Administrator | System configuration, user management, full access |
| Pharmacist | Dispense medicines, record sales, view stock |
| Inventory Manager | Manage procurement, suppliers, stock movements |
| Staff/User | Basic inventory lookup and read-only operations |
| Patients (Indirect) | Benefit from accurate dispensing and availability |
| Regulatory Bodies (Indirect) | Audit logs satisfy compliance requirements |

## 1.5 Business Value

- **Time Savings**: Automated stock tracking saves 4–6 hours per day of manual counting.
- **Financial Accuracy**: Prevents overstocking (capital wastage) and understocking (lost revenue/patient risk).
- **Scalability**: Cloud-ready Docker deployment scales with growing facility size.
- **Data Integrity**: Relational database with constraints ensures no orphaned or duplicate records.

---

# 2. Problem Statement

## 2.1 Background

Medical facilities — including hospitals, clinics, and retail pharmacies — routinely manage thousands of medicine stock-keeping units (SKUs). Traditionally, this inventory is managed through manual registers, spreadsheets, or outdated standalone software. This approach creates critical bottlenecks in one of healthcare's most important operational processes.

## 2.2 Core Problems Identified

### Problem 1: Manual Record-Keeping Errors
Manual entry of stock levels, purchase records, and sales data leads to frequent transcription errors. A single incorrect entry can cause a cascading chain of incorrect inventory counts, wrong reorder quantities, and financial discrepancies.

**Impact**: Estimated 12–15% of inventory records in manual systems contain errors (ISMP studies).

### Problem 2: Stock Shortages and Overstocking
Without real-time visibility into stock levels, facilities routinely experience:
- **Stock-outs**: Critical medicines become unavailable, endangering patient lives.
- **Overstocking**: Excessive purchase of medicines that eventually expire, wasting financial resources.

**Impact**: Medicine stock-outs contribute to approximately 1.5 million preventable medical errors annually in developing countries.

### Problem 3: Expired Medicine Distribution
Manual expiry tracking using physical labels is unreliable. Expired medicines frequently remain in stock and may be inadvertently dispensed to patients, posing serious health risks.

**Impact**: WHO estimates that 20–30% of medicines in manual inventory systems have expired or are near-expiry without staff awareness.

### Problem 4: Supplier Coordination Inefficiency
Managing multiple suppliers across different medicine categories with no digital tracking of purchase orders, payment status, or delivery timelines results in:
- Delayed procurement
- No supplier performance history
- Difficulty renegotiating prices without data

### Problem 5: Lack of Reporting and Analytics
Manual systems cannot easily generate:
- Monthly consumption reports
- Profit/loss analysis per medicine category
- Trend analysis for seasonal demand
- Audit reports for regulatory inspections

**Impact**: Facility managers make procurement decisions based on intuition rather than data.

### Problem 6: Access Control and Security
Paper-based systems offer no access control. Any staff member can modify records, creating opportunities for theft, fraud, and unauthorized dispensing.

## 2.3 Proposed Solution

The **Medical Inventory Management Platform** addresses all six problem areas through:
- **Digital, real-time inventory tracking** with automatic stock level computation
- **Automated alerts** for low stock and expiry conditions
- **Role-based access control** ensuring only authorized personnel perform sensitive operations
- **Complete supplier and purchase management** with a full digital audit trail
- **Rich dashboard and reporting** enabling data-driven operational decisions

---

# 3. User Roles and Permissions

## 3.1 Role Definitions

| Role | Description |
|------|-------------|
| **ADMIN** | System administrator with full access to all modules and configuration |
| **PHARMACIST** | Licensed pharmacist responsible for dispensing and sales operations |
| **INVENTORY_MANAGER** | Procurement and stock specialist managing purchases and supplier relations |
| **STAFF** | General user with read-only access for lookups |

## 3.2 Detailed Permission Matrix

| Module / Operation | ADMIN | PHARMACIST | INVENTORY_MANAGER | STAFF |
|-------------------|:-----:|:----------:|:-----------------:|:-----:|
| **User Management** | | | | |
| View Users | ✅ | ❌ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |
| **Employee Management** | | | | |
| View Employees | ✅ | ✅ | ✅ | ✅ |
| Create Employee | ✅ | ❌ | ❌ | ❌ |
| Edit Employee | ✅ | ❌ | ❌ | ❌ |
| Delete Employee | ✅ | ❌ | ❌ | ❌ |
| **Medicine Management** | | | | |
| View Medicines | ✅ | ✅ | ✅ | ✅ |
| Create Medicine | ✅ | ✅ | ✅ | ❌ |
| Edit Medicine | ✅ | ✅ | ✅ | ❌ |
| Delete Medicine | ✅ | ❌ | ❌ | ❌ |
| **Category Management** | | | | |
| View Categories | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Category | ✅ | ❌ | ✅ | ❌ |
| Delete Category | ✅ | ❌ | ❌ | ❌ |
| **Inventory** | | | | |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Adjust Stock | ✅ | ❌ | ✅ | ❌ |
| View Stock Movements | ✅ | ✅ | ✅ | ❌ |
| **Supplier Management** | | | | |
| View Suppliers | ✅ | ❌ | ✅ | ❌ |
| Create/Edit Supplier | ✅ | ❌ | ✅ | ❌ |
| Delete Supplier | ✅ | ❌ | ❌ | ❌ |
| **Purchase Management** | | | | |
| View Purchases | ✅ | ❌ | ✅ | ❌ |
| Create Purchase | ✅ | ❌ | ✅ | ❌ |
| Approve Purchase | ✅ | ❌ | ❌ | ❌ |
| Cancel Purchase | ✅ | ❌ | ✅ | ❌ |
| **Sales Management** | | | | |
| View Sales | ✅ | ✅ | ❌ | ❌ |
| Create Sale | ✅ | ✅ | ❌ | ❌ |
| Cancel Sale | ✅ | ✅ | ❌ | ❌ |
| **Reports & Analytics** | | | | |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ❌ | ✅ | ❌ |
| Export Reports | ✅ | ❌ | ✅ | ❌ |
| **Alerts** | | | | |
| View Alerts | ✅ | ✅ | ✅ | ✅ |
| Acknowledge Alert | ✅ | ✅ | ✅ | ❌ |
| Configure Alert Thresholds | ✅ | ❌ | ✅ | ❌ |
| **Profile** | | | | |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ | ✅ |

---

# 4. Functional Requirements

## 4.1 Authentication & Authorization

| FR# | Requirement |
|-----|-------------|
| FR-01 | The system shall allow users to register with name, email, password, and role |
| FR-02 | The system shall authenticate users using email and password |
| FR-03 | The system shall issue a signed JWT token upon successful login |
| FR-04 | JWT tokens shall expire after 24 hours and must be refreshed |
| FR-05 | The system shall enforce role-based access control on all API endpoints |
| FR-06 | Passwords shall be encrypted using BCrypt hashing algorithm |
| FR-07 | The system shall reject API requests without a valid Bearer token |
| FR-08 | The system shall log all authentication events |

## 4.2 Employee Management

| FR# | Requirement |
|-----|-------------|
| FR-09 | Admins shall be able to create, read, update, and delete employee records |
| FR-10 | Each employee record shall include: name, email, phone, department, designation, date of joining, and status |
| FR-11 | Employee status shall be ACTIVE or INACTIVE |
| FR-12 | Employee profiles shall be linked to system user accounts |
| FR-13 | The system shall support profile photo upload for employees |

## 4.3 Medicine Management

| FR# | Requirement |
|-----|-------------|
| FR-14 | Users shall be able to add medicines with: name, generic name, brand, category, unit, HSN code, price, reorder level |
| FR-15 | Each medicine shall belong to exactly one category |
| FR-16 | Medicines shall support multiple units (tablets, capsules, ml, mg, strips) |
| FR-17 | The system shall support medicine search by name, generic name, brand, or category |
| FR-18 | Medicine deletion shall be blocked if active inventory exists |
| FR-19 | The system shall allow marking medicines as ACTIVE or DISCONTINUED |

## 4.4 Category Management

| FR# | Requirement |
|-----|-------------|
| FR-20 | The system shall support hierarchical categories (parent-child) |
| FR-21 | Categories shall have name, description, and status |
| FR-22 | Deleting a category with associated medicines shall be blocked |

## 4.5 Supplier Management

| FR# | Requirement |
|-----|-------------|
| FR-23 | The system shall manage supplier records with: name, contact person, email, phone, address, GST number |
| FR-24 | Suppliers shall be linked to their supplied medicines |
| FR-25 | The system shall track total purchase value per supplier |
| FR-26 | Supplier status shall be ACTIVE or INACTIVE |

## 4.6 Inventory Management

| FR# | Requirement |
|-----|-------------|
| FR-27 | The system shall maintain real-time inventory records per medicine with batch number, quantity, and expiry date |
| FR-28 | Inventory shall automatically update upon purchase or sale transactions |
| FR-29 | The system shall prevent sale if insufficient quantity is available |
| FR-30 | The system shall support manual stock adjustments with reason |
| FR-31 | Inventory shall track: current quantity, minimum quantity threshold, batch number, manufacturing date, expiry date |

## 4.7 Purchase Management

| FR# | Requirement |
|-----|-------------|
| FR-32 | Users shall create purchase orders with one or more line items (medicine + quantity + unit cost) |
| FR-33 | Each purchase shall be linked to a supplier and recorded with invoice number and date |
| FR-34 | Purchase status shall be: PENDING → RECEIVED → CANCELLED |
| FR-35 | Marking a purchase as RECEIVED shall automatically increase inventory |
| FR-36 | Cancelling a received purchase shall reverse inventory changes |
| FR-37 | The system shall compute and store total purchase amount |

## 4.8 Sales Management

| FR# | Requirement |
|-----|-------------|
| FR-38 | Users shall create sales transactions with multiple medicine line items |
| FR-39 | Each sale shall record: customer name, sale date, payment method, and items |
| FR-40 | Creating a sale shall automatically deduct quantity from inventory |
| FR-41 | The system shall prevent sale of medicines with zero stock |
| FR-42 | Sale status shall be: COMPLETED, CANCELLED |
| FR-43 | Cancelling a sale shall restore inventory quantities |

## 4.9 Stock Movement Tracking

| FR# | Requirement |
|-----|-------------|
| FR-44 | The system shall log every inventory change as a stock movement |
| FR-45 | Movement types shall include: PURCHASE_IN, SALE_OUT, ADJUSTMENT_IN, ADJUSTMENT_OUT, RETURN_IN, EXPIRED_OUT |
| FR-46 | Each movement shall record: medicine, quantity, movement type, reference ID, performed by, and timestamp |
| FR-47 | Users shall be able to filter stock movements by medicine, type, date range |

## 4.10 Alert Management

| FR# | Requirement |
|-----|-------------|
| FR-48 | The system shall generate LOW_STOCK alerts when quantity falls below reorder level |
| FR-49 | The system shall generate EXPIRY alerts for medicines expiring within 30, 60, and 90 days |
| FR-50 | Alert status shall be: ACTIVE, ACKNOWLEDGED, RESOLVED |
| FR-51 | Authorized users shall acknowledge and resolve alerts |
| FR-52 | Dashboard shall display count of unresolved active alerts |

## 4.11 Dashboard & Reports

| FR# | Requirement |
|-----|-------------|
| FR-53 | Dashboard shall display: total medicines, total inventory value, low stock count, expiring soon count |
| FR-54 | Dashboard shall show recent purchases and recent sales (last 10 each) |
| FR-55 | Dashboard shall show top 5 medicines by stock value |
| FR-56 | The system shall generate: inventory valuation report, purchase report, sales report, expiry report, stock movement report |
| FR-57 | Reports shall support filtering by date range |

---

# 5. Non-Functional Requirements

## 5.1 Performance
| NFR# | Requirement |
|------|-------------|
| NFR-01 | API response time shall be ≤ 500ms for 95% of requests under normal load |
| NFR-02 | Dashboard shall load within 2 seconds for up to 10,000 inventory records |
| NFR-03 | The system shall support at least 50 concurrent users without degradation |

## 5.2 Scalability
| NFR# | Requirement |
|------|-------------|
| NFR-04 | The backend shall be stateless and horizontally scalable |
| NFR-05 | Database connections shall use connection pooling (HikariCP) |
| NFR-06 | The system shall handle up to 100,000 medicine records and 1,000,000 transaction records |

## 5.3 Security
| NFR# | Requirement |
|------|-------------|
| NFR-07 | All API endpoints shall require JWT authentication except `/api/auth/**` |
| NFR-08 | Passwords shall never be stored or transmitted in plaintext |
| NFR-09 | CORS shall be configured to allow only trusted origins |
| NFR-10 | Input validation shall prevent SQL injection and XSS attacks |
| NFR-11 | JWT secret key shall be externally configurable via environment variable |

## 5.4 Reliability
| NFR# | Requirement |
|------|-------------|
| NFR-12 | The system shall achieve 99.5% uptime during business hours |
| NFR-13 | Database transactions shall use ACID properties |
| NFR-14 | The system shall handle API failures gracefully with user-friendly error messages |

## 5.5 Availability
| NFR# | Requirement |
|------|-------------|
| NFR-15 | Planned maintenance windows shall not exceed 30 minutes per week |
| NFR-16 | The system shall support automated database backup daily |

## 5.6 Maintainability
| NFR# | Requirement |
|------|-------------|
| NFR-17 | Code shall follow clean architecture principles (MVC + Service Layer) |
| NFR-18 | All public methods shall have JavaDoc comments |
| NFR-19 | API changes shall maintain backward compatibility with versioning |

## 5.7 Portability
| NFR# | Requirement |
|------|-------------|
| NFR-20 | The application shall be containerized with Docker for cross-platform deployment |
| NFR-21 | Configuration shall use environment variables for all environment-specific values |

## 5.8 Usability
| NFR# | Requirement |
|------|-------------|
| NFR-22 | The UI shall be responsive and support desktop (1920×1080) and tablet (768×1024) |
| NFR-23 | Form validation errors shall be clearly displayed in-line |
| NFR-24 | Loading states shall be shown during all async operations |
| NFR-25 | Confirmation dialogs shall be shown before destructive operations |

## 5.9 Data Integrity
| NFR# | Requirement |
|------|-------------|
| NFR-26 | All foreign key relationships shall be enforced at the database level |
| NFR-27 | Numeric fields shall use DECIMAL type to avoid floating-point precision errors |
| NFR-28 | All timestamps shall use UTC timezone stored as DATETIME |

---

# 6. Scope of the Project

## 6.1 In Scope
- User authentication and role-based authorization
- Complete medicine and category management
- Multi-supplier management with purchase order tracking
- Real-time inventory management with batch and expiry tracking
- Sales transaction recording with stock auto-deduction
- Automated alerts (low stock + expiry)
- Dashboard with KPI metrics and charts
- Stock movement audit log
- Employee profile management
- Report generation (5 report types)
- Docker-based deployment
- REST API with JWT security

## 6.2 Out of Scope (Future Enhancements)
- Point-of-sale (POS) hardware integration
- Mobile application (iOS/Android)
- Prescription management and doctor module
- Insurance and billing integration
- Barcode/QR scanning
- Email/SMS notification delivery
- Multi-branch/pharmacy support
- ERP system integration
