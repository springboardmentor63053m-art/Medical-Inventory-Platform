-- MediStock Database Final Clean Dump
-- Compatible with Spring Boot JPA Long IDs

DROP DATABASE IF EXISTS medistock;

CREATE DATABASE medistock;

USE medistock;

SET FOREIGN_KEY_CHECKS = 0;


-- ==========================
-- ROLES TABLE
-- ==========================

CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=InnoDB;


INSERT INTO roles (id, name) VALUES
(1,'ROLE_ADMIN'),
(2,'ROLE_PHARMACIST'),
(3,'ROLE_STAFF'),
(4,'ROLE_DOCTOR'),
(5,'ROLE_SUPPLIER'),
(6,'ROLE_USER');



-- ==========================
-- USERS TABLE
-- ==========================

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
) ENGINE=InnoDB;


INSERT INTO users
(id,username,email,password,full_name,phone,active)
VALUES

(1,
'admin',
'admin@medistock.com',
'$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS',
'System Administrator',
'9876543210',
1),

(2,
'rahul',
'rahul@gmail.com',
'$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS',
'Rahul Kumar',
'9876543211',
1),

(3,
'sneha',
'sneha@gmail.com',
'$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS',
'Sneha Reddy',
'9876543212',
1),

(4,
'kiran',
'kiran@gmail.com',
'$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS',
'Kiran Kumar',
'9876543213',
1);



-- ==========================
-- USER ROLES TABLE
-- ==========================

CREATE TABLE user_roles (

    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    PRIMARY KEY(user_id,role_id),

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY(role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE

) ENGINE=InnoDB;



INSERT INTO user_roles VALUES
(1,1),
(2,1),
(3,2),
(4,3);



-- ==========================
-- CATEGORIES TABLE
-- ==========================

CREATE TABLE categories (

    id BIGINT NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    PRIMARY KEY(id)

) ENGINE=InnoDB;



INSERT INTO categories
(id,name,description)
VALUES

(1,'Tablet','Tablet Medicines'),
(2,'Capsule','Capsules'),
(3,'Injection','Injectables'),
(4,'Syrup','Liquid Medicines');



-- ==========================
-- SUPPLIERS TABLE
-- ==========================

CREATE TABLE suppliers (

    id BIGINT NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    contact_person VARCHAR(100),

    email VARCHAR(100),

    phone VARCHAR(20),

    address TEXT,

    PRIMARY KEY(id)

) ENGINE=InnoDB;



INSERT INTO suppliers
(id,name,contact_person,email,phone,address)
VALUES

(1,'Apollo Pharma','Dr. Ramesh',
'apollo@gmail.com',
'9876543210',
'Hyderabad'),

(2,'MedPlus Supplier','Suresh V',
'medplus@gmail.com',
'9876543211',
'Bangalore');



-- ==========================
-- MEDICINES TABLE
-- ==========================

CREATE TABLE medicines (

    id BIGINT NOT NULL AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    code VARCHAR(50) UNIQUE,

    generic_name VARCHAR(100),

    manufacturer VARCHAR(100),

    price DECIMAL(10,2),

    expiry_date DATE,

    batch_number VARCHAR(50),

    category_id BIGINT,

    supplier_id BIGINT,


    PRIMARY KEY(id),


    FOREIGN KEY(category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL,


    FOREIGN KEY(supplier_id)
    REFERENCES suppliers(id)
    ON DELETE SET NULL

) ENGINE=InnoDB;



INSERT INTO medicines
(id,name,code,generic_name,manufacturer,price,expiry_date,batch_number,category_id,supplier_id)
VALUES

(1,
'Paracetamol',
'MED-PCM-500',
'Paracetamol 500mg',
'Cipla Ltd',
25.50,
'2028-06-30',
'PCM2026A',
1,
1),


(2,
'Amoxicillin',
'MED-AMX-250',
'Amoxicillin 250mg',
'Sun Pharma',
45.00,
'2027-12-31',
'AMX2026B',
2,
2);


-- ==========================
-- INVENTORY TABLE
-- ==========================

CREATE TABLE inventory (

    id BIGINT NOT NULL AUTO_INCREMENT,

    medicine_id BIGINT NOT NULL UNIQUE,

    quantity INT NOT NULL DEFAULT 0,

    reorder_level INT NOT NULL DEFAULT 10,

    max_quantity INT DEFAULT 1000,

    location_rack VARCHAR(50),

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,


    PRIMARY KEY(id),


    FOREIGN KEY(medicine_id)
    REFERENCES medicines(id)
    ON DELETE CASCADE

) ENGINE=InnoDB;



INSERT INTO inventory
(id,medicine_id,quantity,reorder_level,max_quantity,location_rack)
VALUES

(1,1,100,15,500,'RACK-A1'),

(2,2,80,20,400,'RACK-B2');



-- ==========================
-- PURCHASE ORDERS TABLE
-- ==========================

CREATE TABLE purchase_orders (

    id BIGINT NOT NULL AUTO_INCREMENT,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    supplier_id BIGINT NOT NULL,

    user_id BIGINT,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    total_amount DECIMAL(12,2),

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    PRIMARY KEY(id),


    FOREIGN KEY(supplier_id)
    REFERENCES suppliers(id),


    FOREIGN KEY(user_id)
    REFERENCES users(id)

) ENGINE=InnoDB;



INSERT INTO purchase_orders
(id,order_number,supplier_id,user_id,status,total_amount,order_date)
VALUES

(1,
'PO-2026-001',
1,
1,
'APPROVED',
2550.00,
'2026-07-30 19:21:08');



-- ==========================
-- PURCHASE ORDER ITEMS TABLE
-- ==========================

CREATE TABLE purchase_order_items (

    id BIGINT NOT NULL AUTO_INCREMENT,

    purchase_order_id BIGINT NOT NULL,

    medicine_id BIGINT NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2),

    total_price DECIMAL(10,2),


    PRIMARY KEY(id),


    FOREIGN KEY(purchase_order_id)
    REFERENCES purchase_orders(id)
    ON DELETE CASCADE,


    FOREIGN KEY(medicine_id)
    REFERENCES medicines(id)

) ENGINE=InnoDB;



INSERT INTO purchase_order_items
(id,purchase_order_id,medicine_id,quantity,unit_price,total_price)
VALUES

(1,1,1,100,25.50,2550.00);



-- ==========================
-- BATCHES TABLE
-- ==========================

CREATE TABLE batches (

    id BIGINT NOT NULL AUTO_INCREMENT,

    medicine_id BIGINT,

    batch_no VARCHAR(100),

    mfg_date DATE,

    expiry_date DATE,


    PRIMARY KEY(id),


    FOREIGN KEY(medicine_id)
    REFERENCES medicines(id)

) ENGINE=InnoDB;



INSERT INTO batches
(id,medicine_id,batch_no,mfg_date,expiry_date)
VALUES

(1,
1,
'PCM2026A',
'2026-01-01',
'2028-06-30');



-- ==========================
-- STOCK MOVEMENTS TABLE
-- ==========================

CREATE TABLE stock_movements (

    id BIGINT NOT NULL AUTO_INCREMENT,

    batch_id BIGINT,

    type ENUM('IN','OUT'),

    quantity INT,

    date DATETIME DEFAULT CURRENT_TIMESTAMP,

    user_id BIGINT,


    PRIMARY KEY(id),


    FOREIGN KEY(batch_id)
    REFERENCES batches(id),


    FOREIGN KEY(user_id)
    REFERENCES users(id)

) ENGINE=InnoDB;



-- ==========================
-- NOTIFICATIONS TABLE
-- ==========================

CREATE TABLE notifications (

    id BIGINT NOT NULL AUTO_INCREMENT,

    user_id BIGINT,

    type VARCHAR(50),

    message TEXT,

    is_read TINYINT(1) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    PRIMARY KEY(id),


    FOREIGN KEY(user_id)
    REFERENCES users(id)

) ENGINE=InnoDB;



INSERT INTO notifications
(id,user_id,type,message,is_read)
VALUES

(1,
1,
'Stock',
'Paracetamol Stock Added',
0);



SET FOREIGN_KEY_CHECKS = 1;