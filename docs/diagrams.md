# MediStock Pro — Medical Inventory Management Platform
## Diagrams & Architecture Documentation
### Infosys Springboard Internship | B.Tech Computer Science Engineering

---

## 1. Application Workflow Diagram

```mermaid
flowchart TD
    A([?? User]) --> B{Has Account?}
    B -- No --> C[Register with Role]
    C --> D[Account Created]
    D --> E
    B -- Yes --> E[Login: Email + Password]
    E --> F{JWT Valid?}
    F -- No --> G[? Auth Error ? Redirect to Login]
    F -- Yes --> H[JWT Token Issued & Stored]
    H --> I[?? Dashboard — KPI Cards + Charts]

    I --> J{Select Module}

    J --> K[?? Medicine Management]
    K --> K1[Search / Filter / CRUD]
    K1 --> K2[Update Category & Supplier links]

    J --> L[?? Inventory Management]
    L --> L1[View All / Low Stock / Expiring tabs]
    L1 --> L2{Stock Low?}
    L2 -- Yes --> L3[?? LOW_STOCK Alert Generated]
    L1 --> L4{Near Expiry?}
    L4 -- Yes --> L5[?? EXPIRY Alert Generated]
    L1 --> L6[Manual Stock Adjustment with Reason]

    J --> M[?? Supplier Management]
    M --> M1[CRUD Supplier Profiles]
    M1 --> M2[GST, License, Contact, City, Rating]

    J --> N[?? Purchase Management]
    N --> N1[Create Purchase Order]
    N1 --> N2[Select Supplier + Add Medicine Items]
    N2 --> N3{Mark as RECEIVED?}
    N3 -- Yes --> N4[? Auto Increase Inventory +qty]
    N4 --> N5[?? Log StockMovement: PURCHASE_IN]
    N3 -- Cancel --> N6[? Purchase CANCELLED]

    J --> O[?? Sales Management]
    O --> O1[Create Sale: Multi-item cart]
    O1 --> O2{Sufficient Stock?}
    O2 -- No --> O3[? Block Sale: Insufficient Stock]
    O2 -- Yes --> O4[Record Sale Items + Payment Method]
    O4 --> O5[? Auto Deduct Inventory -qty]
    O5 --> O6[?? Log StockMovement: SALE_OUT]
    O6 --> O7{qty < reorderLevel?}
    O7 -- Yes --> O8[?? Auto-create LOW_STOCK Alert]

    J --> P[?? Reports & Analytics]
    P --> P1[Select Report Type]
    P1 --> P2[Set Date Range Filter]
    P2 --> P3[Generate Report from Database]
    P3 --> P4[Export PDF / CSV Download]

    J --> Q[?? Employee Management]
    Q --> Q1[CRUD Employee Profiles]
    Q1 --> Q2[Link User Account & Role]

    J --> R[?? Alert Center]
    R --> R1[View Active Alerts]
    R1 --> R2[Acknowledge Alert]
    R2 --> R3[Resolve Alert]

    J --> S[?? Scheduled Alert Engine]
    S --> S1[@Scheduled - Daily at 6 AM]
    S1 --> S2[Scan all Inventory Records]
    S2 --> S3{qty < reorderLevel?}
    S3 -- Yes --> S4[Create LOW_STOCK Alert]
    S2 --> S5{Expiry = 30/60/90 days?}
    S5 -- Yes --> S6[Create EXPIRY Alert]
```

---

## 2. System Architecture Layers

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT LAYER — React 18 + Vite 5"]
        direction TB
        UI["Pages: Dashboard, Medicines, Inventory, Suppliers\nPurchases, Sales, Alerts, Reports, Employees\nProfile, Settings, Project Plan"]
        CTX["Contexts: AuthContext (JWT) · ThemeContext (Dark/Light)"]
        AX["Axios Instance: Bearer Token Interceptor + 401 Auto-Logout"]
    end

    subgraph SECURITY["SECURITY GATEWAY — Spring Security"]
        direction TB
        CORS["CORS Filter: whitelisted origins (:5173, :3000)"]
        JWT["JwtAuthFilter: extract ? validate ? set SecurityContext"]
        ROLE["Role Authorization: @PreAuthorize / Method Security"]
    end

    subgraph API["API CONTROLLER LAYER — Spring Boot 3.2.5"]
        direction LR
        AUTH["AuthController"]
        DASH["DashboardController"]
        MED["MedicineController"]
        INV["InventoryController"]
        SUP["SupplierController"]
        PUR["PurchaseController"]
        SAL["SalesController"]
        ALE["AlertController"]
        EMP["EmployeeController"]
        CAT["CategoryController"]
    end

    subgraph SERVICE["SERVICE LAYER — Business Logic"]
        direction LR
        SS["StockService: qty calculations"]
        AS["AlertService: create/update alerts"]
        RS["ReportService: aggregations"]
        SCH["@Scheduled: AlertEngine (6 AM daily)"]
    end

    subgraph DB["DATABASE LAYER — H2 / MySQL 8"]
        direction LR
        T1["roles · users · employees"]
        T2["categories · suppliers · medicines"]
        T3["inventory · purchases · purchase_items"]
        T4["sales · sale_items · stock_movements · alerts"]
    end

    CLIENT -->|HTTP REST / Vite proxy| SECURITY
    SECURITY --> API
    API --> SERVICE
    SERVICE -->|JPA / Hibernate| DB
```

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ROLES {
        bigint id PK
        varchar name UK "ADMIN|PHARMACIST|INVENTORY_MANAGER|STAFF"
        varchar description
    }
    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password "BCrypt"
        bigint role_id FK
        boolean is_active
        datetime last_login
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
        enum status "ACTIVE|INACTIVE"
    }
    CATEGORIES {
        bigint id PK
        varchar name UK
        varchar description
        bigint parent_id FK "self-reference"
        enum status "ACTIVE|INACTIVE"
    }
    SUPPLIERS {
        bigint id PK
        varchar name
        varchar contact_person
        varchar email
        varchar phone
        varchar city
        varchar state
        varchar gst_number
        varchar license_number
        enum status "ACTIVE|INACTIVE"
        decimal credit_limit
    }
    MEDICINES {
        bigint id PK
        varchar name
        varchar generic_name
        varchar brand_name
        bigint category_id FK
        bigint supplier_id FK
        varchar unit "tablets|capsules|ml|mg"
        varchar hsn_code
        decimal unit_price
        decimal mrp
        int reorder_level
        enum status "ACTIVE|DISCONTINUED"
    }
    INVENTORY {
        bigint id PK
        bigint medicine_id FK
        varchar batch_number
        int quantity
        int minimum_quantity
        date manufacture_date
        date expiry_date
        varchar location
        decimal purchase_price
        decimal selling_price
    }
    PURCHASES {
        bigint id PK
        varchar invoice_number UK
        bigint supplier_id FK
        date purchase_date
        decimal subtotal
        decimal discount
        decimal tax_amount
        decimal net_amount
        enum status "PENDING|RECEIVED|CANCELLED"
        bigint created_by FK
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
        varchar customer_phone
        date sale_date
        enum payment_method "CASH|CARD|UPI|INSURANCE"
        decimal subtotal
        decimal discount
        decimal tax_amount
        decimal net_amount
        enum status "COMPLETED|CANCELLED"
        bigint created_by FK
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
        enum movement_type "PURCHASE_IN|SALE_OUT|ADJUSTMENT_IN|ADJUSTMENT_OUT|RETURN_IN|EXPIRED_OUT"
        int quantity
        bigint reference_id
        varchar reference_type
        varchar reason
        bigint performed_by FK
        datetime movement_date
    }
    ALERTS {
        bigint id PK
        bigint medicine_id FK
        enum alert_type "LOW_STOCK|EXPIRY_30_DAYS|EXPIRY_60_DAYS|EXPIRY_90_DAYS|OUT_OF_STOCK"
        varchar message
        enum status "ACTIVE|ACKNOWLEDGED|RESOLVED"
        bigint acknowledged_by FK
        datetime acknowledged_at
        bigint resolved_by FK
        datetime resolved_at
    }

    ROLES ||--o{ USERS : "has"
    USERS ||--o| EMPLOYEES : "linked to"
    CATEGORIES ||--o{ MEDICINES : "categorizes"
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    SUPPLIERS ||--o{ MEDICINES : "supplies"
    MEDICINES ||--o| INVENTORY : "tracked in"
    SUPPLIERS ||--o{ PURCHASES : "fulfills"
    PURCHASES ||--|{ PURCHASE_ITEMS : "contains"
    MEDICINES ||--o{ PURCHASE_ITEMS : "in"
    SALES ||--|{ SALE_ITEMS : "contains"
    MEDICINES ||--o{ SALE_ITEMS : "sold in"
    MEDICINES ||--o{ STOCK_MOVEMENTS : "tracked by"
    MEDICINES ||--o{ ALERTS : "triggers"
    USERS ||--o{ PURCHASES : "creates"
    USERS ||--o{ SALES : "creates"
    USERS ||--o{ STOCK_MOVEMENTS : "performs"
    USERS ||--o{ ALERTS : "acknowledges"
```

---

## 4. JWT Authentication Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Axios
    participant SpringSecurity
    participant AuthController
    participant JwtUtil
    participant DB

    User->>React: Enter email + password
    React->>Axios: POST /api/auth/login
    Axios->>SpringSecurity: Request (no JWT — public endpoint)
    SpringSecurity->>AuthController: Forward (public)
    AuthController->>DB: Find user by email
    DB-->>AuthController: User entity
    AuthController->>SpringSecurity: loadUserByUsername()
    SpringSecurity->>AuthController: BCrypt verify password
    AuthController->>JwtUtil: generateToken(userDetails)
    JwtUtil-->>AuthController: Signed JWT (30 days)
    AuthController-->>Axios: { token, username, role }
    Axios-->>React: Response
    React->>React: localStorage.setItem('token', jwt)
    React->>React: AuthContext.setUser({ role, username })
    React-->>User: Redirect to /dashboard

    Note over React,DB: Subsequent authenticated requests
    User->>React: Navigate to /medicines
    React->>Axios: GET /api/medicines
    Axios->>Axios: Interceptor adds: Authorization: Bearer <jwt>
    Axios->>SpringSecurity: Request with Bearer token
    SpringSecurity->>JwtUtil: validateToken(token)
    JwtUtil-->>SpringSecurity: valid = true, username = "admin"
    SpringSecurity->>SpringSecurity: Set SecurityContext
    SpringSecurity->>AuthController: Forward to MedicineController
    AuthController->>DB: medicineRepository.findAll()
    DB-->>AuthController: List<Medicine>
    AuthController-->>Axios: 200 OK [ medicines... ]
    Axios-->>React: Response data
    React-->>User: Display medicines table
```

---

## 5. Purchase ? Stock Update Flow

```mermaid
sequenceDiagram
    participant IM as Inventory Manager
    participant UI as React Frontend
    participant PC as PurchaseController
    participant PS as PurchaseService
    participant IS as InventoryService
    participant SM as StockMovementRepo
    participant DB as Database

    IM->>UI: Create Purchase Order (Supplier + Items)
    UI->>PC: POST /api/purchases
    PC->>PS: createPurchase(dto)
    PS->>DB: Save Purchase (status: PENDING)
    PS->>DB: Save PurchaseItems
    PS-->>PC: Purchase created
    PC-->>UI: 201 Created

    IM->>UI: Click "Mark Received"
    UI->>PC: PUT /api/purchases/{id}/receive
    PC->>PS: receivePurchase(id)
    loop For each PurchaseItem
        PS->>IS: findInventoryByMedicine(medicineId)
        IS->>DB: SELECT inventory WHERE medicine_id = ?
        DB-->>IS: InventoryRecord
        IS->>IS: inventory.quantity += item.quantity
        IS->>DB: SAVE inventory (updated quantity)
        PS->>SM: save(StockMovement{type: PURCHASE_IN})
        SM->>DB: INSERT stock_movements
    end
    PS->>DB: UPDATE purchase SET status = RECEIVED
    PS-->>PC: success
    PC-->>UI: 200 OK
    UI->>UI: Reload purchases + inventory data
    UI-->>IM: ? Stock updated successfully
```

---

## 6. Sale ? Auto Stock Deduction Flow

```mermaid
sequenceDiagram
    participant PH as Pharmacist
    participant UI as React Frontend
    participant SC as SalesController
    participant SS as SalesService
    participant IS as InventoryService
    participant AS as AlertService

    PH->>UI: Create Sale (customer + items)
    UI->>SC: POST /api/sales
    SC->>SS: createSale(dto)
    
    loop For each SaleItem
        SS->>IS: getInventory(medicineId)
        IS-->>SS: InventoryRecord
        alt Insufficient Stock
            SS-->>SC: throw InsufficientStockException
            SC-->>UI: 400 Bad Request
            UI-->>PH: ? Insufficient stock
        else Sufficient Stock
            SS->>IS: inventory.qty -= item.qty
            IS->>IS: Save updated inventory
            SS->>IS: logMovement(SALE_OUT)
            
            IS->>IS: Check: qty < reorderLevel?
            alt qty < reorderLevel
                IS->>AS: createLowStockAlert(medicine)
                AS->>AS: Save Alert (type: LOW_STOCK)
            end
        end
    end
    
    SS->>SS: Save Sale (status: COMPLETED)
    SS-->>SC: Sale created
    SC-->>UI: 201 Created
    UI-->>PH: ? Sale recorded, stock deducted
```

---

## 7. Scheduled Alert Engine Flow

```mermaid
flowchart TD
    CRON["? @Scheduled cron = 0 0 6 * * ?<br/>Fires every day at 6:00 AM"]
    CRON --> LOAD["Load ALL inventory records from DB"]
    LOAD --> LOOP["For each InventoryRecord"]
    
    LOOP --> C1{qty < medicine.reorderLevel?}
    C1 -- Yes --> A1["Create/Update LOW_STOCK Alert<br/>status: ACTIVE"]
    
    LOOP --> C2{expiry = 30 days?}
    C2 -- Yes --> A2["Create EXPIRY_30_DAYS Alert<br/>status: ACTIVE"]
    
    LOOP --> C3{expiry = 60 days?}
    C3 -- Yes --> A3["Create EXPIRY_60_DAYS Alert<br/>status: ACTIVE"]
    
    LOOP --> C4{expiry = 90 days?}
    C4 -- Yes --> A4["Create EXPIRY_90_DAYS Alert<br/>status: ACTIVE"]
    
    A1 & A2 & A3 & A4 --> DONE["? Alert sweep complete<br/>Dashboard badge count updated"]
```

---

*MediStock Pro — Diagrams & Architecture | Infosys Springboard Internship | B.Tech CSE*
