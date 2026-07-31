-- MediStock Database Dump
-- Compatible with Spring Boot 3.x JPA Entities and Spring Security

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `purchase_order_items`;
DROP TABLE IF EXISTS `purchase_orders`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `batches`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `medicines`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------
-- Table structure for table `roles`
-- ------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_PHARMACIST'),
(3, 'ROLE_STAFF'),
(4, 'ROLE_DOCTOR'),
(5, 'ROLE_SUPPLIER'),
(6, 'ROLE_USER');

-- ------------------------------------------------------
-- Table structure for table `users`
-- ------------------------------------------------------
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Note: Seed passwords are hashed with BCrypt for password 'admin123'
-- BCrypt Hash: $2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS
INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `active`) VALUES
(1, 'admin', 'admin@medistock.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'System Administrator', '9876543210', 1),
(2, 'rahul', 'rahul@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Rahul Kumar', '9876543211', 1),
(3, 'sneha', 'sneha@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Sneha Reddy', '9876543212', 1),
(4, 'kiran', 'kiran@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Kiran Kumar', '9876543213', 1);

-- ------------------------------------------------------
-- Table structure for table `user_roles`
-- ------------------------------------------------------
CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 1), -- rahul -> ROLE_ADMIN
(3, 2), -- sneha -> ROLE_PHARMACIST
(4, 3); -- kiran -> ROLE_STAFF

-- ------------------------------------------------------
-- Table structure for table `categories`
-- ------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Tablet', 'Tablet Medicines'),
(2, 'Capsule', 'Capsules'),
(3, 'Injection', 'Injectables'),
(4, 'Syrup', 'Liquid Medicines');

-- ------------------------------------------------------
-- Table structure for table `suppliers`
-- ------------------------------------------------------
CREATE TABLE `suppliers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `contact_person` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`) VALUES
(1, 'Apollo Pharma', 'Dr. Ramesh', 'apollo@gmail.com', '9876543210', 'Hyderabad'),
(2, 'MedPlus Supplier', 'Suresh V', 'medplus@gmail.com', '9876543211', 'Bangalore');

-- ------------------------------------------------------
-- Table structure for table `medicines`
-- ------------------------------------------------------
CREATE TABLE `medicines` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL UNIQUE,
  `generic_name` VARCHAR(100) DEFAULT NULL,
  `manufacturer` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(10,2) DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `batch_number` VARCHAR(50) DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `supplier_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_medicines_category` (`category_id`),
  KEY `fk_medicines_supplier` (`supplier_id`),
  CONSTRAINT `fk_medicines_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_medicines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `medicines` (`id`, `name`, `code`, `generic_name`, `manufacturer`, `price`, `expiry_date`, `batch_number`, `category_id`, `supplier_id`) VALUES
(1, 'Paracetamol', 'MED-PCM-500', 'Paracetamol 500mg', 'Cipla Ltd', 25.50, '2028-06-30', 'PCM2026A', 1, 1),
(2, 'Amoxicillin', 'MED-AMX-250', 'Amoxicillin 250mg', 'Sun Pharma', 45.00, '2027-12-31', 'AMX2026B', 2, 2);

-- ------------------------------------------------------
-- Table structure for table `inventory`
-- ------------------------------------------------------
CREATE TABLE `inventory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `medicine_id` INT NOT NULL UNIQUE,
  `quantity` INT NOT NULL DEFAULT 0,
  `reorder_level` INT NOT NULL DEFAULT 10,
  `max_quantity` INT DEFAULT 1000,
  `location_rack` VARCHAR(50) DEFAULT NULL,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_inventory_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory` (`id`, `medicine_id`, `quantity`, `reorder_level`, `max_quantity`, `location_rack`) VALUES
(1, 1, 100, 15, 500, 'RACK-A1'),
(2, 2, 80, 20, 400, 'RACK-B2');

-- ------------------------------------------------------
-- Table structure for table `purchase_orders`
-- ------------------------------------------------------
CREATE TABLE `purchase_orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `supplier_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `total_amount` DECIMAL(12,2) DEFAULT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_po_supplier` (`supplier_id`),
  KEY `fk_po_user` (`user_id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `fk_po_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `purchase_orders` (`id`, `order_number`, `supplier_id`, `user_id`, `status`, `total_amount`, `order_date`) VALUES
(1, 'PO-2026-001', 1, 1, 'APPROVED', 2550.00, '2026-07-30 19:21:08');

-- ------------------------------------------------------
-- Table structure for table `purchase_order_items`
-- ------------------------------------------------------
CREATE TABLE `purchase_order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` INT NOT NULL,
  `medicine_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) DEFAULT NULL,
  `total_price` DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_poi_purchase_order` (`purchase_order_id`),
  KEY `fk_poi_medicine` (`medicine_id`),
  CONSTRAINT `fk_poi_purchase_order` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_poi_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `medicine_id`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 100, 25.50, 2550.00);

-- ------------------------------------------------------
-- Table structure for table `batches` (Legacy/Support)
-- ------------------------------------------------------
CREATE TABLE `batches` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `medicine_id` INT DEFAULT NULL,
  `batch_no` VARCHAR(100) DEFAULT NULL,
  `mfg_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_batches_medicine` (`medicine_id`),
  CONSTRAINT `fk_batches_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `batches` (`id`, `medicine_id`, `batch_no`, `mfg_date`, `expiry_date`) VALUES
(1, 1, 'PCM2026A', '2026-01-01', '2028-06-30');

-- ------------------------------------------------------
-- Table structure for table `stock_movements` (Legacy/Support)
-- ------------------------------------------------------
CREATE TABLE `stock_movements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_id` INT DEFAULT NULL,
  `type` ENUM('IN','OUT') DEFAULT NULL,
  `quantity` INT DEFAULT NULL,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sm_batch` (`batch_id`),
  KEY `fk_sm_user` (`user_id`),
  CONSTRAINT `fk_sm_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  CONSTRAINT `fk_sm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------
-- Table structure for table `notifications`
-- ------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT NULL,
  `message` TEXT,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `is_read`) VALUES
(1, 1, 'Stock', 'Paracetamol Stock Added', 0);
