-- ============================================================
--  MEDICAL INVENTORY MANAGEMENT PLATFORM
--  MySQL 8 Database Schema
--  Fully Normalized (3NF) | Production-Ready
-- ============================================================

CREATE DATABASE IF NOT EXISTS medical_inventory_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE medical_inventory_db;

-- ============================================================
-- TABLE 1: roles
-- ============================================================
CREATE TABLE roles (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_role_name CHECK (name IN ('ADMIN','PHARMACIST','INVENTORY_MANAGER','STAFF'))
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2: users
-- ============================================================
CREATE TABLE users (
    id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(100)  NOT NULL UNIQUE,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    password     VARCHAR(255)  NOT NULL,
    role_id      BIGINT        NOT NULL,
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login   DATETIME,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ============================================================
-- TABLE 3: employees
-- ============================================================
CREATE TABLE employees (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    department      VARCHAR(100),
    designation     VARCHAR(100),
    date_of_joining DATE,
    address         TEXT,
    profile_image   VARCHAR(500),
    status          ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_employees_status ON employees(status);

-- ============================================================
-- TABLE 4: categories
-- ============================================================
CREATE TABLE categories (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    parent_id   BIGINT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 5: suppliers
-- ============================================================
CREATE TABLE suppliers (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    email          VARCHAR(150),
    phone          VARCHAR(20)  NOT NULL,
    address        TEXT,
    city           VARCHAR(100),
    state          VARCHAR(100),
    pincode        VARCHAR(10),
    gst_number     VARCHAR(20),
    license_number VARCHAR(50),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_suppliers_active ON suppliers(is_active);

-- ============================================================
-- TABLE 6: medicines
-- ============================================================
CREATE TABLE medicines (
    id             BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(200)    NOT NULL,
    generic_name   VARCHAR(200),
    brand_name     VARCHAR(200),
    category_id    BIGINT          NOT NULL,
    supplier_id    BIGINT,
    unit           VARCHAR(50)     NOT NULL DEFAULT 'Tablets',
    hsn_code       VARCHAR(20),
    description    TEXT,
    unit_price     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    mrp            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    reorder_level  INT             NOT NULL DEFAULT 10,
    status         ENUM('ACTIVE','DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicines_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_medicines_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_medicines_category ON medicines(category_id);
CREATE INDEX idx_medicines_status   ON medicines(status);
CREATE FULLTEXT INDEX ft_medicines_search ON medicines(name, generic_name, brand_name);

-- ============================================================
-- TABLE 7: inventory
-- ============================================================
CREATE TABLE inventory (
    id               BIGINT         AUTO_INCREMENT PRIMARY KEY,
    medicine_id      BIGINT         NOT NULL UNIQUE,
    batch_number     VARCHAR(100),
    quantity         INT            NOT NULL DEFAULT 0,
    min_quantity     INT            NOT NULL DEFAULT 10,
    manufacturing_dt DATE,
    expiry_date      DATE,
    location         VARCHAR(100),
    last_updated     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    CONSTRAINT chk_inventory_quantity CHECK (quantity >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_inventory_expiry   ON inventory(expiry_date);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- ============================================================
-- TABLE 8: purchases
-- ============================================================
CREATE TABLE purchases (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    invoice_number  VARCHAR(100)   NOT NULL UNIQUE,
    supplier_id     BIGINT         NOT NULL,
    purchase_date   DATE           NOT NULL,
    total_amount    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    discount        DECIMAL(10,2)           DEFAULT 0.00,
    tax_amount      DECIMAL(10,2)           DEFAULT 0.00,
    net_amount      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    status          ENUM('PENDING','RECEIVED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    created_by      BIGINT         NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_supplier   FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_purchases_created_by FOREIGN KEY (created_by)  REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_status   ON purchases(status);
CREATE INDEX idx_purchases_date     ON purchases(purchase_date);

-- ============================================================
-- TABLE 9: purchase_items
-- ============================================================
CREATE TABLE purchase_items (
    id            BIGINT        AUTO_INCREMENT PRIMARY KEY,
    purchase_id   BIGINT        NOT NULL,
    medicine_id   BIGINT        NOT NULL,
    batch_number  VARCHAR(100),
    quantity      INT           NOT NULL,
    unit_cost     DECIMAL(10,2) NOT NULL,
    total_cost    DECIMAL(12,2) NOT NULL,
    expiry_date   DATE,
    CONSTRAINT fk_pitems_purchase  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    CONSTRAINT fk_pitems_medicine  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT chk_pitems_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_pitems_purchase  ON purchase_items(purchase_id);
CREATE INDEX idx_pitems_medicine  ON purchase_items(medicine_id);

-- ============================================================
-- TABLE 10: sales
-- ============================================================
CREATE TABLE sales (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    sale_number     VARCHAR(100)   NOT NULL UNIQUE,
    customer_name   VARCHAR(200),
    customer_phone  VARCHAR(20),
    sale_date       DATE           NOT NULL,
    total_amount    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    discount        DECIMAL(10,2)           DEFAULT 0.00,
    tax_amount      DECIMAL(10,2)           DEFAULT 0.00,
    net_amount      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    payment_method  ENUM('CASH','CARD','UPI','INSURANCE') NOT NULL DEFAULT 'CASH',
    status          ENUM('COMPLETED','CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    notes           TEXT,
    created_by      BIGINT         NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_sales_date       ON sales(sale_date);
CREATE INDEX idx_sales_status     ON sales(status);
CREATE INDEX idx_sales_created_by ON sales(created_by);

-- ============================================================
-- TABLE 11: sale_items
-- ============================================================
CREATE TABLE sale_items (
    id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
    sale_id      BIGINT        NOT NULL,
    medicine_id  BIGINT        NOT NULL,
    quantity     INT           NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    total_price  DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_sitems_sale     FOREIGN KEY (sale_id)     REFERENCES sales(id) ON DELETE CASCADE,
    CONSTRAINT fk_sitems_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    CONSTRAINT chk_sitems_qty CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_sitems_sale     ON sale_items(sale_id);
CREATE INDEX idx_sitems_medicine ON sale_items(medicine_id);

-- ============================================================
-- TABLE 12: stock_movements
-- ============================================================
CREATE TABLE stock_movements (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    medicine_id     BIGINT       NOT NULL,
    movement_type   ENUM('PURCHASE_IN','SALE_OUT','ADJUSTMENT_IN','ADJUSTMENT_OUT','RETURN_IN','EXPIRED_OUT') NOT NULL,
    quantity        INT          NOT NULL,
    quantity_before INT          NOT NULL,
    quantity_after  INT          NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    reason          TEXT,
    performed_by    BIGINT       NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_smov_medicine     FOREIGN KEY (medicine_id)   REFERENCES medicines(id),
    CONSTRAINT fk_smov_performed_by FOREIGN KEY (performed_by)  REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_smov_medicine   ON stock_movements(medicine_id);
CREATE INDEX idx_smov_type       ON stock_movements(movement_type);
CREATE INDEX idx_smov_created_at ON stock_movements(created_at);

-- ============================================================
-- TABLE 13: alerts
-- ============================================================
CREATE TABLE alerts (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    alert_type      ENUM('LOW_STOCK','EXPIRY_30_DAYS','EXPIRY_60_DAYS','EXPIRY_90_DAYS','OUT_OF_STOCK') NOT NULL,
    medicine_id     BIGINT       NOT NULL,
    message         TEXT         NOT NULL,
    status          ENUM('ACTIVE','ACKNOWLEDGED','RESOLVED') NOT NULL DEFAULT 'ACTIVE',
    acknowledged_by BIGINT,
    acknowledged_at DATETIME,
    resolved_at     DATETIME,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_medicine       FOREIGN KEY (medicine_id)     REFERENCES medicines(id),
    CONSTRAINT fk_alerts_acknowledged   FOREIGN KEY (acknowledged_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_alerts_status      ON alerts(status);
CREATE INDEX idx_alerts_type        ON alerts(alert_type);
CREATE INDEX idx_alerts_medicine    ON alerts(medicine_id);
