# Medical Inventory Management Platform
## Diagrams — Week 1

---

## 1. Workflow Diagram

```mermaid
flowchart TD
    A([👤 User]) --> B{Has Account?}
    B -- No --> C[Register with Role]
    C --> D[Admin Approves Account]
    D --> E
    B -- Yes --> E[Login with Email + Password]
    E --> F{JWT Valid?}
    F -- No --> G[❌ Authentication Error\nRedirect to Login]
    F -- Yes --> H[JWT Token Issued]
    H --> I[🏠 Dashboard]

    I --> J{Select Module}

    J --> K[💊 Medicine Management]
    K --> K1[Add/Edit/Delete Medicine]
    K1 --> K2[Update Category & Supplier]

    J --> L[📦 Inventory Management]
    L --> L1[View Stock Levels]
    L1 --> L2{Stock Low?}
    L2 -- Yes --> L3[🔔 Generate LOW_STOCK Alert]
    L2 --> L4{Near Expiry?}
    L4 -- Yes --> L5[🔔 Generate EXPIRY Alert]

    J --> M[🏭 Supplier Management]
    M --> M1[Add/Edit Supplier]
    M1 --> M2[Link Supplier to Medicines]

    J --> N[🛒 Purchase Management]
    N --> N1[Create Purchase Order]
    N1 --> N2[Link to Supplier + Items]
    N2 --> N3[Mark as RECEIVED]
    N3 --> N4[🔄 Auto-Update Inventory +]
    N4 --> N5[Log Stock Movement: PURCHASE_IN]

    J --> O[💰 Sales Management]
    O --> O1[Create Sale Transaction]
    O1 --> O2{Stock Available?}
    O2 -- No --> O3[❌ Block Sale\nInsufficient Stock]
    O2 -- Yes --> O4[Record Sale Items]
    O4 --> O5[🔄 Auto-Deduct Inventory -]
    O5 --> O6[Log Stock Movement: SALE_OUT]

    J --> P[📊 Reports & Analytics]
    P --> P1[Select Report Type]
    P1 --> P2[Apply Date Filters]
    P2 --> P3[Generate Report from DB]
    P3 --> P4[Display / Export PDF]

    J --> Q[👥 Employee Management]
    Q --> Q1[CRUD Employee Profiles]
    Q1 --> Q2[Assign User Account & Role]

    N5 --> DB[(🗄️ MySQL Database)]
    O6 --> DB
    K2 --> DB
    L3 --> DB
    L5 --> DB
    P3 --> DB

    DB --> R[📈 Dashboard Metrics Refresh]
    R --> I
```

---

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer — React 18 + Vite"]
        direction TB
        UI1[Login / Register Page]
        UI2[Dashboard Page]
        UI3[Medicine / Inventory Pages]
        UI4[Purchase / Sales Pages]
        UI5[Reports / Alerts Pages]
        AUTH_CTX[AuthContext — JWT Storage]
        AX[Axios Interceptor — Bearer Token]
    end

    subgraph GATEWAY["🔒 Security Gateway"]
        CORS[CORS Filter]
        JWT_FILTER[JWT Authentication Filter]
        SPRING_SEC[Spring Security Filter Chain]
    end

    subgraph BACKEND["☕ Spring Boot 3 Backend — Java 21"]
        direction TB
        subgraph CTRL["Controller Layer — REST APIs"]
            C1[AuthController]
            C2[MedicineController]
            C3[InventoryController]
            C4[PurchaseController]
            C5[SalesController]
            C6[ReportController]
            C7[DashboardController]
            C8[AlertController]
        end

        subgraph SVC["Service Layer — Business Logic"]
            S1[AuthService]
            S2[MedicineService]
            S3[InventoryService]
            S4[PurchaseService]
            S5[SalesService]
            S6[ReportService]
            S7[AlertService]
        end

        subgraph REPO["Repository Layer — Spring Data JPA"]
            R1[UserRepository]
            R2[MedicineRepository]
            R3[InventoryRepository]
            R4[PurchaseRepository]
            R5[SalesRepository]
            R6[StockMovementRepository]
            R7[AlertRepository]
        end

        JWT_UTIL[JwtUtil — Token Gen/Validate]
        ERR_HANDLER[GlobalExceptionHandler]
    end

    subgraph DB["🗄️ Persistence Layer"]
        MYSQL[(MySQL 8\nDatabase)]
        HCP[HikariCP Connection Pool]
    end

    subgraph ALERT_MOD["🔔 Alert Engine"]
        SCHED[Spring @Scheduled Tasks]
        ALERT_CHECK[Low Stock Checker\nExpiry Checker]
    end

    CLIENT -- HTTPS REST Calls --> GATEWAY
    GATEWAY --> CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> HCP
    HCP --> MYSQL
    JWT_UTIL -.-> JWT_FILTER
    SVC -.-> ALERT_MOD
    ALERT_MOD --> MYSQL
```

---

## 3. ER Diagram (Entity Relationship)

```mermaid
erDiagram
    ROLES {
        bigint id PK
        varchar name UK
        varchar description
        datetime created_at
    }

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        bigint role_id FK
        boolean is_active
        datetime last_login
        datetime created_at
    }

    EMPLOYEES {
        bigint id PK
        bigint user_id FK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone
        varchar department
        varchar designation
        date date_of_joining
        text address
        enum status
        datetime created_at
    }

    CATEGORIES {
        bigint id PK
        varchar name UK
        text description
        bigint parent_id FK
        boolean is_active
    }

    MEDICINES {
        bigint id PK
        varchar name
        varchar generic_name
        varchar brand_name
        bigint category_id FK
        bigint supplier_id FK
        varchar unit
        varchar hsn_code
        decimal unit_price
        decimal mrp
        int reorder_level
        enum status
    }

    SUPPLIERS {
        bigint id PK
        varchar name
        varchar contact_person
        varchar email
        varchar phone
        text address
        varchar gst_number
        boolean is_active
    }

    INVENTORY {
        bigint id PK
        bigint medicine_id FK
        varchar batch_number
        int quantity
        int min_quantity
        date manufacturing_dt
        date expiry_date
        varchar location
        datetime last_updated
    }

    PURCHASES {
        bigint id PK
        varchar invoice_number UK
        bigint supplier_id FK
        date purchase_date
        decimal total_amount
        decimal net_amount
        enum status
        bigint created_by FK
        datetime created_at
    }

    PURCHASE_ITEMS {
        bigint id PK
        bigint purchase_id FK
        bigint medicine_id FK
        varchar batch_number
        int quantity
        decimal unit_cost
        decimal total_cost
        date expiry_date
    }

    SALES {
        bigint id PK
        varchar sale_number UK
        varchar customer_name
        date sale_date
        decimal total_amount
        decimal net_amount
        enum payment_method
        enum status
        bigint created_by FK
        datetime created_at
    }

    SALE_ITEMS {
        bigint id PK
        bigint sale_id FK
        bigint medicine_id FK
        int quantity
        decimal unit_price
        decimal total_price
    }

    STOCK_MOVEMENTS {
        bigint id PK
        bigint medicine_id FK
        enum movement_type
        int quantity
        int quantity_before
        int quantity_after
        varchar reference_type
        bigint reference_id
        text reason
        bigint performed_by FK
        datetime created_at
    }

    ALERTS {
        bigint id PK
        enum alert_type
        bigint medicine_id FK
        text message
        enum status
        bigint acknowledged_by FK
        datetime acknowledged_at
        datetime created_at
    }

    %% Relationships
    ROLES ||--o{ USERS : "has"
    USERS ||--o| EMPLOYEES : "has profile"
    CATEGORIES ||--o{ MEDICINES : "classifies"
    CATEGORIES ||--o{ CATEGORIES : "parent of"
    SUPPLIERS ||--o{ MEDICINES : "supplies"
    MEDICINES ||--|| INVENTORY : "tracked in"
    SUPPLIERS ||--o{ PURCHASES : "sourced from"
    USERS ||--o{ PURCHASES : "created by"
    PURCHASES ||--|{ PURCHASE_ITEMS : "contains"
    MEDICINES ||--o{ PURCHASE_ITEMS : "included in"
    USERS ||--o{ SALES : "created by"
    SALES ||--|{ SALE_ITEMS : "contains"
    MEDICINES ||--o{ SALE_ITEMS : "sold as"
    MEDICINES ||--o{ STOCK_MOVEMENTS : "tracked by"
    USERS ||--o{ STOCK_MOVEMENTS : "performed by"
    MEDICINES ||--o{ ALERTS : "triggers"
    USERS ||--o{ ALERTS : "acknowledged by"
```

---

## 4. Use Case Diagram (Textual with Mermaid)

```mermaid
graph LR
    ADMIN((Admin))
    PHARM((Pharmacist))
    INV((Inventory Manager))
    STAFF((Staff))

    subgraph AUTH["Authentication"]
        UC1[Login]
        UC2[Register]
        UC3[Change Password]
    end

    subgraph MED["Medicine Module"]
        UC4[View Medicines]
        UC5[Add Medicine]
        UC6[Edit Medicine]
        UC7[Delete Medicine]
    end

    subgraph INV_MOD["Inventory Module"]
        UC8[View Inventory]
        UC9[Adjust Stock]
        UC10[View Stock Movements]
    end

    subgraph PURCH["Purchase Module"]
        UC11[Create Purchase]
        UC12[Receive Purchase]
        UC13[Cancel Purchase]
    end

    subgraph SALE["Sales Module"]
        UC14[Create Sale]
        UC15[Cancel Sale]
        UC16[View Sales History]
    end

    subgraph REPORT["Reports"]
        UC17[View Dashboard]
        UC18[Generate Reports]
    end

    subgraph ALERT["Alerts"]
        UC19[View Alerts]
        UC20[Acknowledge Alert]
    end

    ADMIN --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7
    ADMIN --> UC8 & UC9 & UC10 & UC11 & UC12 & UC13
    ADMIN --> UC14 & UC15 & UC16 & UC17 & UC18 & UC19 & UC20

    PHARM --> UC1 & UC3 & UC4 & UC8 & UC10
    PHARM --> UC14 & UC15 & UC16 & UC17 & UC19 & UC20

    INV --> UC1 & UC3 & UC4 & UC8 & UC9 & UC10
    INV --> UC11 & UC12 & UC13 & UC17 & UC18 & UC19 & UC20

    STAFF --> UC1 & UC3 & UC4 & UC8 & UC17 & UC19
```

---

## 5. Activity Diagram — Purchase Receiving Flow

```mermaid
flowchart TD
    A([Start]) --> B[Inventory Manager creates Purchase Order]
    B --> C[Select Supplier]
    C --> D[Add Medicine Line Items\nQuantity + Unit Cost + Batch + Expiry]
    D --> E[Submit Purchase Order]
    E --> F[System saves with status = PENDING]
    F --> G{Purchase Arrived?}
    G -- No --> H[Wait / Follow Up with Supplier]
    H --> G
    G -- Yes --> I[Mark Purchase as RECEIVED]
    I --> J{For each Purchase Item}
    J --> K{Medicine in Inventory?}
    K -- Yes --> L[Add quantity to existing record]
    K -- No --> M[Create new Inventory record]
    L --> N[Log StockMovement: PURCHASE_IN]
    M --> N
    N --> O{More Items?}
    O -- Yes --> J
    O -- No --> P[Update Purchase total amounts]
    P --> Q[Check Low Stock Alerts — resolve if applicable]
    Q --> R([End])
```

---

## 6. Activity Diagram — Sale Transaction Flow

```mermaid
flowchart TD
    A([Start]) --> B[Pharmacist initiates Sale]
    B --> C[Enter Customer Name & Payment Method]
    C --> D[Add Medicine Items to Cart]
    D --> E{For each Medicine}
    E --> F[Check Inventory]
    F --> G{Sufficient Stock?}
    G -- No --> H[❌ Show Error: Insufficient Stock]
    H --> D
    G -- Yes --> I{More Items?}
    I -- Yes --> E
    I -- No --> J[Calculate Totals\nSubtotal + Tax - Discount]
    J --> K[Confirm & Submit Sale]
    K --> L{For each Sale Item}
    L --> M[Deduct Quantity from Inventory]
    M --> N[Log StockMovement: SALE_OUT]
    N --> O{More Items?}
    O -- Yes --> L
    O -- No --> P{Inventory Below Reorder Level?}
    P -- Yes --> Q[🔔 Generate LOW_STOCK Alert]
    P --> R[Save Sale with status = COMPLETED]
    Q --> R
    R --> S[Generate Sale Number]
    S --> T([End])
```
