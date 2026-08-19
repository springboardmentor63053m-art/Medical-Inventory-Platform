-- MediStock Consolidated Clean Database Dump
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_ADMIN','ROLE_PHARMACIST','ROLE_DOCTOR','ROLE_SUPPLIER','ROLE_STAFF','ROLE_USER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_PHARMACIST'),
(4, 'ROLE_DOCTOR'),
(5, 'ROLE_SUPPLIER'),
(3, 'ROLE_STAFF'),
(6, 'ROLE_USER');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `active`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@medistock.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'System Administrator', '9876543210', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50'),
(2, 'rahul', 'rahul@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Rahul Kumar', '9876543211', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50'),
(3, 'sneha', 'sneha@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Sneha Reddy', '9876543212', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50'),
(4, 'kiran', 'kiran@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Kiran Kumar', '9876543213', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50'),
(5, 'Sharma', 'sharma23@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Sani Sharma', '9878678799', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50'),
(6, 'Supplier2', 'supplier2@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'MedPlus Supplier', '9876543211', 1, '2026-08-19 13:00:50', '2026-08-19 13:00:50');

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3),
(5, 5),
(6, 5);

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Tablet', 'Tablet Medicines'),
(2, 'Capsule', 'Capsules'),
(3, 'Injection', 'Injectables'),
(4, 'Syrup', 'Liquid Medicines'),
(5, 'Analgesics', 'Category for Analgesics'),
(6, 'Antibiotics', 'Category for Antibiotics'),
(7, 'Antidiabetics', 'Category for Antidiabetics'),
(8, 'Cardiovascular', 'Category for Cardiovascular'),
(9, 'Antihistamines', 'Category for Antihistamines'),
(10, 'Gastrointestinal', 'Category for Gastrointestinal'),
(11, 'Respiratory', 'Category for Respiratory');

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `user_id`) VALUES
(1, 'Apollo Pharma', 'Dr. Ramesh', 'apollo@gmail.com', '9876543210', 'Hyderabad', NULL),
(5, 'Sani Sharma', 'Sani Sharma', 'sharma23@gmail.com', '9878678799', 'Kolkata', 5),
(6, 'MedPlus Supplier', 'Suresh V', 'medplus@gmail.com', '9876543211', 'Bangalore', 6);

DROP TABLE IF EXISTS `medicines`;
CREATE TABLE `medicines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `generic_name` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `category_id` (`category_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `medicines_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `medicines_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `medicines` (`id`, `name`, `code`, `generic_name`, `manufacturer`, `price`, `expiry_date`, `batch_number`, `category_id`, `supplier_id`) VALUES
(1, 'Paracetamol 500 mg', 'MED-PCM-500', 'Paracetamol', 'Cipla Ltd', '25.50', '2028-06-30', 'PCM2026A', 1, 5),
(2, 'Amoxicillin 250 mg', 'MED-AMX-250', 'Amoxicillin', 'Sun Pharma', '45.00', '2027-12-31', 'AMX2026B', 2, 5),
(3, 'Paracetamol 650 mg', 'MED-3001', 'Paracetamol Extra', 'GSK', '15.50', '2027-06-15', 'BAT-P650', 5, 5),
(4, 'Amoxicillin 500 mg', 'MED-3002', 'Amoxicillin Trihydrate', 'Alkem', '25.00', '2026-11-20', 'BAT-A500', 6, 5),
(5, 'Ibuprofen 400 mg', 'MED-3003', 'Ibuprofen', 'Abbott', '18.00', '2027-01-10', 'BAT-I400', 5, 5),
(6, 'Metformin 500 mg', 'MED-3004', 'Metformin Hydrochloride', 'Mankind', '12.00', '2027-08-05', 'BAT-M500', 7, 5),
(7, 'Atorvastatin 10 mg', 'MED-3005', 'Atorvastatin Calcium', 'Pfizer', '35.00', '2026-09-12', 'BAT-A10', 8, 5),
(8, 'Cetirizine 10 mg', 'MED-3006', 'Cetirizine Dihydrochloride', 'Cipla', '8.50', '2027-03-25', 'BAT-C10', 9, 5),
(9, 'Pantoprazole 40 mg', 'MED-3007', 'Pantoprazole Sodium', 'Sun Pharma', '22.00', '2026-10-18', 'BAT-P40', 10, 5),
(10, 'Amlodipine 5 mg', 'MED-3008', 'Amlodipine Besylate', 'Lupin', '10.50', '2027-05-30', 'BAT-AM5', 8, 5),
(11, 'Azithromycin 500 mg', 'MED-3009', 'Azithromycin Dihydrate', 'Sandoz', '45.00', '2026-12-05', 'BAT-AZ500', 6, 5),
(12, 'Losartan 50 mg', 'MED-3010', 'Losartan Potassium', 'Merck', '28.00', '2027-04-14', 'BAT-L50', 8, 5),
(13, 'Omeprazole 20 mg', 'MED-3011', 'Omeprazole', 'AstraZeneca', '14.00', '2027-02-28', 'BAT-O20', 10, 5),
(14, 'Ranitidine 150 mg', 'MED-3012', 'Ranitidine Hydrochloride', 'Glaxo', '9.00', '2026-08-30', 'BAT-R150', 10, 5),
(15, 'Ciprofloxacin 500 mg', 'MED-3013', 'Ciprofloxacin Hydrochloride', 'Bayer', '32.00', '2026-10-22', 'BAT-CP500', 6, 5),
(16, 'Aspirin 75 mg', 'MED-3014', 'Acetylsalicylic Acid', 'Bayer', '6.00', '2027-09-01', 'BAT-ASP75', 5, 5),
(17, 'Albuterol Inhaler 90 mcg', 'MED-3015', 'Albuterol Sulfate', 'GSK', '120.00', '2026-09-06', 'BAT-ALB90', 11, 5),
(18, 'Dexamethasone 4 mg', 'MED-3016', 'Dexamethasone Sodium', 'Zydus', '16.00', '2027-07-20', 'BAT-DEX4', 5, 6),
(19, 'Furosemide 40 mg', 'MED-3017', 'Furosemide', 'Sanofi', '11.00', '2027-03-15', 'BAT-FUR40', 8, 6),
(20, 'Hydrochlorothiazide 12.5 mg', 'MED-3018', 'Hydrochlorothiazide', 'Torrent', '14.50', '2026-11-10', 'BAT-HCT12', 8, 6),
(21, 'Levothyroxine 50 mcg', 'MED-3019', 'Levothyroxine Sodium', 'AbbVie', '29.00', '2027-10-05', 'BAT-LEV50', 7, 6),
(22, 'Montelukast 10 mg', 'MED-3020', 'Montelukast Sodium', 'Organon', '38.00', '2026-12-18', 'BAT-MON10', 11, 6),
(23, 'Tramadol 50 mg', 'MED-3021', 'Tramadol Hydrochloride', 'Grünenthal', '42.00', '2027-01-25', 'BAT-TRA50', 5, 6),
(24, 'Gabapentin 300 mg', 'MED-3022', 'Gabapentin', 'Pfizer Ltd', '55.00', '2027-08-14', 'BAT-GAB300', 5, 6),
(25, 'Sertraline 50 mg', 'MED-3023', 'Sertraline Hydrochloride', 'Viatris', '31.00', '2026-10-30', 'BAT-SER50', 5, 6),
(26, 'Escitalopram 10 mg', 'MED-3024', 'Escitalopram Oxalate', 'Lundbeck', '27.50', '2027-05-12', 'BAT-ESC10', 5, 6),
(27, 'Lisinopril 10 mg', 'MED-3025', 'Lisinopril Dihydrate', 'AstraZeneca Ltd', '19.00', '2027-02-18', 'BAT-LIS10', 8, 6),
(28, 'Metoprolol 50 mg', 'MED-3026', 'Metoprolol Succinate', 'Novartis', '23.00', '2026-09-22', 'BAT-MET50', 8, 6),
(29, 'Clopidogrel 75 mg', 'MED-3027', 'Clopidogrel Bisulfate', 'Sanofi India', '48.00', '2027-11-08', 'BAT-CLO75', 8, 6),
(30, 'Rosuvastatin 10 mg', 'MED-3028', 'Rosuvastatin Calcium', 'AstraZeneca Rx', '52.00', '2026-12-30', 'BAT-ROS10', 8, 6),
(31, 'Doxycycline 100 mg', 'MED-3029', 'Doxycycline Hyclate', 'Hikma', '36.00', '2027-04-02', 'BAT-DOX100', 6, 6),
(32, 'Cephalexin 500 mg', 'MED-3030', 'Cephalexin Monohydrate', 'Teva', '41.00', '2026-08-25', 'BAT-CEP500', 6, 6),
(33, 'Ciprofloxacin 250 mg', 'MED-3031', 'Ciprofloxacin LowDose', 'Bayer Health', '22.00', '2027-06-30', 'BAT-CP250', 6, 5),
(34, 'Prednisone 10 mg', 'MED-3032', 'Prednisone', 'Horizon', '17.50', '2027-09-15', 'BAT-PRED10', 5, 5),
(35, 'Ondansetron 4 mg', 'MED-3033', 'Ondansetron Hydrochloride', 'Novartis Pharma', '33.00', '2026-10-05', 'BAT-OND4', 10, 5);

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `medicine_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '10',
  `max_quantity` int DEFAULT '1000',
  `location_rack` varchar(50) DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `inventory` (`id`, `medicine_id`, `quantity`, `reorder_level`, `max_quantity`, `location_rack`, `last_updated`) VALUES
(1, 1, 100, 10, 100, 'RACK-A1', '2026-08-19 15:39:41'),
(2, 2, 100, 10, 100, 'RACK-A2', '2026-08-19 15:39:41'),
(3, 3, 50, 10, 100, 'RACK-A3', '2026-08-19 15:39:41'),
(4, 4, 50, 10, 100, 'RACK-A4', '2026-08-19 15:39:41'),
(5, 5, 50, 10, 100, 'RACK-A5', '2026-08-19 15:39:41'),
(6, 6, 50, 10, 100, 'RACK-A6', '2026-08-19 15:39:41'),
(7, 7, 50, 10, 100, 'RACK-A7', '2026-08-19 15:39:41'),
(8, 8, 50, 10, 100, 'RACK-A8', '2026-08-19 15:39:41'),
(9, 9, 50, 10, 100, 'RACK-A9', '2026-08-19 15:39:41'),
(10, 10, 50, 10, 100, 'RACK-A10', '2026-08-19 15:39:41'),
(11, 11, 50, 10, 100, 'RACK-A11', '2026-08-19 15:39:41'),
(12, 12, 50, 10, 100, 'RACK-A12', '2026-08-19 15:39:41'),
(13, 13, 50, 10, 100, 'RACK-A13', '2026-08-19 15:39:41'),
(14, 14, 50, 10, 100, 'RACK-A14', '2026-08-19 15:39:41'),
(15, 15, 50, 10, 100, 'RACK-A15', '2026-08-19 15:39:41'),
(16, 16, 50, 10, 100, 'RACK-A16', '2026-08-19 15:39:41'),
(17, 17, 50, 10, 100, 'RACK-A17', '2026-08-19 15:39:41'),
(18, 18, 50, 10, 100, 'RACK-A18', '2026-08-19 15:39:41'),
(19, 19, 50, 10, 100, 'RACK-A19', '2026-08-19 15:39:41'),
(20, 20, 50, 10, 100, 'RACK-A20', '2026-08-19 15:39:41'),
(21, 21, 50, 10, 100, 'RACK-A21', '2026-08-19 15:39:41'),
(22, 22, 50, 10, 100, 'RACK-A22', '2026-08-19 15:39:41'),
(23, 23, 50, 10, 100, 'RACK-A23', '2026-08-19 15:39:41'),
(24, 24, 50, 10, 100, 'RACK-A24', '2026-08-19 15:39:41'),
(25, 25, 50, 10, 100, 'RACK-A25', '2026-08-19 15:39:41'),
(26, 26, 50, 10, 100, 'RACK-A26', '2026-08-19 15:39:41'),
(27, 27, 50, 10, 100, 'RACK-A27', '2026-08-19 15:39:41'),
(28, 28, 50, 10, 100, 'RACK-A28', '2026-08-19 15:39:41'),
(29, 29, 50, 10, 100, 'RACK-A29', '2026-08-19 15:39:41'),
(30, 30, 50, 10, 100, 'RACK-A30', '2026-08-19 15:39:41'),
(31, 31, 50, 10, 100, 'RACK-A31', '2026-08-19 15:39:41'),
(32, 32, 50, 10, 100, 'RACK-A32', '2026-08-19 15:39:41'),
(33, 33, 50, 10, 100, 'RACK-A33', '2026-08-19 15:39:41'),
(34, 34, 50, 10, 100, 'RACK-A34', '2026-08-19 15:39:41'),
(35, 35, 50, 10, 100, 'RACK-A35', '2026-08-19 15:39:41');

DROP TABLE IF EXISTS `supplier_medicines`;
CREATE TABLE `supplier_medicines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available_quantity` int NOT NULL,
  `supplier_id` bigint NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `generic_name` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `supplier_medicines_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_medicines_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `supplier_medicines` (`id`, `available_quantity`, `supplier_id`, `name`, `code`, `generic_name`, `manufacturer`, `price`, `expiry_date`, `batch_number`, `category_id`) VALUES
(1, 500, 1, 'Paracetamol 500 mg', 'MED-PCM-500', 'Paracetamol', 'Cipla Ltd', '25.50', '2028-06-30', 'PCM2026A', 1),
(2, 100, 5, 'Paracetamol 500 mg', 'MED-PCM-500', 'Paracetamol', 'Cipla Ltd', '25.50', '2028-06-30', 'PCM2026A', 1),
(3, 100, 5, 'Amoxicillin 250 mg', 'MED-AMX-250', 'Amoxicillin', 'Sun Pharma', '45.00', '2027-12-31', 'AMX2026B', 2),
(4, 100, 5, 'Paracetamol 650 mg', 'MED-3001', 'Paracetamol Extra', 'GSK', '15.50', '2027-06-15', 'BAT-P650', 5),
(5, 100, 5, 'Amoxicillin 500 mg', 'MED-3002', 'Amoxicillin Trihydrate', 'Alkem', '25.00', '2026-11-20', 'BAT-A500', 6),
(6, 100, 5, 'Ibuprofen 400 mg', 'MED-3003', 'Ibuprofen', 'Abbott', '18.00', '2027-01-10', 'BAT-I400', 5),
(7, 100, 5, 'Metformin 500 mg', 'MED-3004', 'Metformin Hydrochloride', 'Mankind', '12.00', '2027-08-05', 'BAT-M500', 7),
(8, 100, 5, 'Atorvastatin 10 mg', 'MED-3005', 'Atorvastatin Calcium', 'Pfizer', '35.00', '2026-09-12', 'BAT-A10', 8),
(9, 100, 5, 'Cetirizine 10 mg', 'MED-3006', 'Cetirizine Dihydrochloride', 'Cipla', '8.50', '2027-03-25', 'BAT-C10', 9),
(10, 100, 5, 'Pantoprazole 40 mg', 'MED-3007', 'Pantoprazole Sodium', 'Sun Pharma', '22.00', '2026-10-18', 'BAT-P40', 10),
(11, 100, 5, 'Amlodipine 5 mg', 'MED-3008', 'Amlodipine Besylate', 'Lupin', '10.50', '2027-05-30', 'BAT-AM5', 8),
(12, 100, 5, 'Azithromycin 500 mg', 'MED-3009', 'Azithromycin Dihydrate', 'Sandoz', '45.00', '2026-12-05', 'BAT-AZ500', 6),
(13, 100, 5, 'Losartan 50 mg', 'MED-3010', 'Losartan Potassium', 'Merck', '28.00', '2027-04-14', 'BAT-L50', 8),
(14, 100, 5, 'Omeprazole 20 mg', 'MED-3011', 'Omeprazole', 'AstraZeneca', '14.00', '2027-02-28', 'BAT-O20', 10),
(15, 100, 5, 'Ranitidine 150 mg', 'MED-3012', 'Ranitidine Hydrochloride', 'Glaxo', '9.00', '2026-08-30', 'BAT-R150', 10),
(16, 100, 5, 'Ciprofloxacin 500 mg', 'MED-3013', 'Ciprofloxacin Hydrochloride', 'Bayer', '32.00', '2026-10-22', 'BAT-CP500', 6),
(17, 100, 5, 'Aspirin 75 mg', 'MED-3014', 'Acetylsalicylic Acid', 'Bayer', '6.00', '2027-09-01', 'BAT-ASP75', 5),
(18, 100, 5, 'Albuterol Inhaler 90 mcg', 'MED-3015', 'Albuterol Sulfate', 'GSK', '120.00', '2026-09-06', 'BAT-ALB90', 11),
(33, 150, 6, 'Dexamethasone 4 mg', 'MED-3016', 'Dexamethasone Sodium', 'Zydus', '16.00', '2027-07-20', 'BAT-DEX4', 5),
(34, 150, 6, 'Furosemide 40 mg', 'MED-3017', 'Furosemide', 'Sanofi', '11.00', '2027-03-15', 'BAT-FUR40', 8),
(35, 150, 6, 'Hydrochlorothiazide 12.5 mg', 'MED-3018', 'Hydrochlorothiazide', 'Torrent', '14.50', '2026-11-10', 'BAT-HCT12', 8),
(36, 150, 6, 'Levothyroxine 50 mcg', 'MED-3019', 'Levothyroxine Sodium', 'AbbVie', '29.00', '2027-10-05', 'BAT-LEV50', 7),
(37, 150, 6, 'Montelukast 10 mg', 'MED-3020', 'Montelukast Sodium', 'Organon', '38.00', '2026-12-18', 'BAT-MON10', 11),
(38, 150, 6, 'Tramadol 50 mg', 'MED-3021', 'Tramadol Hydrochloride', 'Grünenthal', '42.00', '2027-01-25', 'BAT-TRA50', 5),
(39, 150, 6, 'Gabapentin 300 mg', 'MED-3022', 'Gabapentin', 'Pfizer Ltd', '55.00', '2027-08-14', 'BAT-GAB300', 5),
(40, 150, 6, 'Sertraline 50 mg', 'MED-3023', 'Sertraline Hydrochloride', 'Viatris', '31.00', '2026-10-30', 'BAT-SER50', 5),
(41, 150, 6, 'Escitalopram 10 mg', 'MED-3024', 'Escitalopram Oxalate', 'Lundbeck', '27.50', '2027-05-12', 'BAT-ESC10', 5),
(42, 150, 6, 'Lisinopril 10 mg', 'MED-3025', 'Lisinopril Dihydrate', 'AstraZeneca Ltd', '19.00', '2027-02-18', 'BAT-LIS10', 8),
(43, 150, 6, 'Metoprolol 50 mg', 'MED-3026', 'Metoprolol Succinate', 'Novartis', '23.00', '2026-09-22', 'BAT-MET50', 8),
(44, 150, 6, 'Clopidogrel 75 mg', 'MED-3027', 'Clopidogrel Bisulfate', 'Sanofi India', '48.00', '2027-11-08', 'BAT-CLO75', 8),
(45, 150, 6, 'Rosuvastatin 10 mg', 'MED-3028', 'Rosuvastatin Calcium', 'AstraZeneca Rx', '52.00', '2026-12-30', 'BAT-ROS10', 8),
(46, 150, 6, 'Doxycycline 100 mg', 'MED-3029', 'Doxycycline Hyclate', 'Hikma', '36.00', '2027-04-02', 'BAT-DOX100', 6),
(47, 150, 6, 'Cephalexin 500 mg', 'MED-3030', 'Cephalexin Monohydrate', 'Teva', '41.00', '2026-08-25', 'BAT-CEP500', 6),
(48, 150, 6, 'Ciprofloxacin 250 mg', 'MED-3031', 'Ciprofloxacin LowDose', 'Bayer Health', '22.00', '2027-06-30', 'BAT-CP250', 6),
(49, 150, 6, 'Prednisone 10 mg', 'MED-3032', 'Prednisone', 'Horizon', '17.50', '2027-09-15', 'BAT-PRED10', 5);

DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `supplier_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `status` enum('PENDING','APPROVED','SHIPPED','RECEIVED','CANCELLED') NOT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `supplier_id` (`supplier_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `purchase_orders` (`id`, `order_number`, `supplier_id`, `user_id`, `status`, `total_amount`, `order_date`) VALUES
(1, 'PO-2026-001', 1, 1, 'APPROVED', '2550.00', '2026-07-30 19:21:08');

DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint NOT NULL,
  `supplier_medicine_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_order_id` (`purchase_order_id`),
  KEY `supplier_medicine_id` (`supplier_medicine_id`),
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`supplier_medicine_id`) REFERENCES `supplier_medicines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `supplier_medicine_id`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 100, '25.50', '2550.00');

DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `medicine_id` bigint DEFAULT NULL,
  `batch_no` varchar(100) DEFAULT NULL,
  `mfg_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `batches` (`id`, `medicine_id`, `batch_no`, `mfg_date`, `expiry_date`) VALUES
(1, 1, 'PCM2026A', '2026-01-01', '2028-06-30');

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `batch_id` bigint DEFAULT NULL,
  `type` enum('IN','OUT') DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `batch_id` (`batch_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 'Stock', 'Paracetamol Stock Added', 0, '2026-08-19 13:00:50');

DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `final_amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `sale_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `medicine_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
