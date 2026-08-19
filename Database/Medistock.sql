-- MediStock Database Clean Dump with Separated Catalogues
-- Compatible with Spring Boot JPA

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
) ENGINE=InnoDB;

INSERT INTO users (id,username,email,password,full_name,phone,active) VALUES
(1, 'admin', 'admin@medistock.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'System Administrator', '9876543210', 1),
(2, 'rahul', 'rahul@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Rahul Kumar', '9876543211', 1),
(3, 'sneha', 'sneha@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Sneha Reddy', '9876543212', 1),
(4, 'kiran', 'kiran@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Kiran Kumar', '9876543213', 1),
(5, 'Sharma', 'sharma23@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'Sani Sharma', '9878678799', 1),
(6, 'Supplier2', 'supplier2@gmail.com', '$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS', 'MedPlus Supplier', '9876543211', 1);

-- ==========================
-- USER ROLES TABLE
-- ==========================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY(user_id,role_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO user_roles VALUES
(1,1),
(2,1),
(3,2),
(4,3),
(5,5),
(6,5);

-- ==========================
-- CATEGORIES TABLE
-- ==========================
CREATE TABLE categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    PRIMARY KEY(id)
) ENGINE=InnoDB;

INSERT INTO categories (id,name,description) VALUES
(1,'Tablet','Tablet Medicines'),
(2,'Capsule','Capsules'),
(3,'Injection','Injectables'),
(4,'Syrup','Liquid Medicines'),
(5,'Analgesics','Category for Analgesics'),
(6,'Antibiotics','Category for Antibiotics'),
(7,'Antidiabetics','Category for Antidiabetics'),
(8,'Cardiovascular','Category for Cardiovascular'),
(9,'Antihistamines','Category for Antihistamines'),
(10,'Gastrointestinal','Category for Gastrointestinal'),
(11,'Respiratory','Category for Respiratory');

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
    user_id BIGINT,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO suppliers (id,name,contact_person,email,phone,address,user_id) VALUES
(1,'Apollo Pharma','Dr. Ramesh','apollo@gmail.com','9876543210','Hyderabad',NULL),
(5,'Sani Sharma','Sani Sharma','sharma23@gmail.com','9878678799','Kolkata',5),
(6,'MedPlus Supplier','Suresh V','medplus@gmail.com','9876543211','Bangalore',6);

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
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO medicines VALUES 
(1,'Paracetamol','MED-PCM-500','Paracetamol 500mg','Cipla Ltd',25.50,'2028-06-30','PCM2026A',1,5),
(2,'Amoxicillin','MED-AMX-250','Amoxicillin 250mg','Sun Pharma',45.00,'2027-12-31','AMX2026B',2,5),
(3,'Paracetamol 650 mg','MED-3001-1','Paracetamol','GSK',15.50,'2027-06-15','BAT-P650',5,5),
(4,'Paracetamol 650 mg','MED-3001-2','Paracetamol','GSK',15.50,'2027-06-15','BAT-P650',5,5),
(5,'Amoxicillin 500 mg','MED-3002-1','Amoxicillin Trihydrate','Alkem',25.00,'2026-11-20','BAT-A500',6,5),
(6,'Amoxicillin 500 mg','MED-3002-2','Amoxicillin Trihydrate','Alkem',25.00,'2026-11-20','BAT-A500',6,5),
(7,'Ibuprofen 400 mg','MED-3003-1','Ibuprofen','Abbott',18.00,'2027-01-10','BAT-I400',5,5),
(8,'Ibuprofen 400 mg','MED-3003-2','Ibuprofen','Abbott',18.00,'2027-01-10','BAT-I400',5,5),
(9,'Metformin 500 mg','MED-3004-1','Metformin Hydrochloride','Mankind',12.00,'2027-08-05','BAT-M500',7,5),
(10,'Metformin 500 mg','MED-3004-2','Metformin Hydrochloride','Mankind',12.00,'2027-08-05','BAT-M500',7,5),
(11,'Atorvastatin 10 mg','MED-3005-1','Atorvastatin Calcium','Pfizer',35.00,'2026-09-12','BAT-A10',8,5),
(12,'Atorvastatin 10 mg','MED-3005-2','Atorvastatin Calcium','Pfizer',35.00,'2026-09-12','BAT-A10',8,5),
(13,'Cetirizine 10 mg','MED-3006-1','Cetirizine Dihydrochloride','Cipla',8.50,'2027-03-25','BAT-C10',9,5),
(14,'Cetirizine 10 mg','MED-3006-2','Cetirizine Dihydrochloride','Cipla',8.50,'2027-03-25','BAT-C10',9,5),
(15,'Pantoprazole 40 mg','MED-3007-1','Pantoprazole Sodium','Sun Pharma',22.00,'2026-10-18','BAT-P40',10,5),
(16,'Pantoprazole 40 mg','MED-3007-2','Pantoprazole Sodium','Sun Pharma',22.00,'2026-10-18','BAT-P40',10,5),
(17,'Amlodipine 5 mg','MED-3008-1','Amlodipine Besylate','Lupin',10.50,'2027-05-30','BAT-AM5',8,5),
(18,'Amlodipine 5 mg','MED-3008-2','Amlodipine Besylate','Lupin',10.50,'2027-05-30','BAT-AM5',8,5),
(19,'Azithromycin 500 mg','MED-3009-1','Azithromycin Dihydrate','Sandoz',45.00,'2026-12-05','BAT-AZ500',6,5),
(20,'Azithromycin 500 mg','MED-3009-2','Azithromycin Dihydrate','Sandoz',45.00,'2026-12-05','BAT-AZ500',6,5),
(21,'Losartan 50 mg','MED-3010-1','Losartan Potassium','Merck',28.00,'2027-04-14','BAT-L50',8,5),
(22,'Losartan 50 mg','MED-3010-2','Losartan Potassium','Merck',28.00,'2027-04-14','BAT-L50',8,5),
(23,'Omeprazole 20 mg','MED-3011-1','Omeprazole','AstraZeneca',14.00,'2027-02-28','BAT-O20',10,5),
(24,'Omeprazole 20 mg','MED-3011-2','Omeprazole','AstraZeneca',14.00,'2027-02-28','BAT-O20',10,5),
(25,'Ranitidine 150 mg','MED-3012-1','Ranitidine Hydrochloride','Glaxo',9.00,'2026-08-30','BAT-R150',10,5),
(26,'Ranitidine 150 mg','MED-3012-2','Ranitidine Hydrochloride','Glaxo',9.00,'2026-08-30','BAT-R150',10,5),
(27,'Ciprofloxacin 500 mg','MED-3013-1','Ciprofloxacin Hydrochloride','Bayer',32.00,'2026-10-22','BAT-CP500',6,5),
(28,'Ciprofloxacin 500 mg','MED-3013-2','Ciprofloxacin Hydrochloride','Bayer',32.00,'2026-10-22','BAT-CP500',6,5),
(29,'Aspirin 75 mg','MED-3014-1','Acetylsalicylic Acid','Bayer',6.00,'2027-09-01','BAT-ASP75',5,5),
(30,'Aspirin 75 mg','MED-3014-2','Acetylsalicylic Acid','Bayer',6.00,'2027-09-01','BAT-ASP75',5,5),
(31,'Albuterol Inhaler 90 mcg','MED-3015-1','Albuterol Sulfate','GSK',120.00,'2026-09-06','BAT-ALB90',11,5),
(32,'Albuterol Inhaler 90 mcg','MED-3015-2','Albuterol Sulfate','GSK',120.00,'2026-09-06','BAT-ALB90',11,5),
(33,'Paracetamol 650 mg','MED-3001-3','Paracetamol','GSK',15.50,'2027-06-15','BAT-P650',5,5),
(34,'Paracetamol 650 mg','MED-3001-4','Paracetamol','GSK',15.50,'2027-06-15','BAT-P650',5,5),
(35,'Amoxicillin 500 mg','MED-3002-3','Amoxicillin Trihydrate','Alkem',25.00,'2026-11-20','BAT-A500',6,5),
(36,'Amoxicillin 500 mg','MED-3002-4','Amoxicillin Trihydrate','Alkem',25.00,'2026-11-20','BAT-A500',6,5),
(37,'Ibuprofen 400 mg','MED-3003-3','Ibuprofen','Abbott',18.00,'2027-01-10','BAT-I400',5,5),
(38,'Ibuprofen 400 mg','MED-3003-4','Ibuprofen','Abbott',18.00,'2027-01-10','BAT-I400',5,5),
(39,'Metformin 500 mg','MED-3004-3','Metformin Hydrochloride','Mankind',12.00,'2027-08-05','BAT-M500',7,5),
(40,'Metformin 500 mg','MED-3004-4','Metformin Hydrochloride','Mankind',12.00,'2027-08-05','BAT-M500',7,5),
(41,'Atorvastatin 10 mg','MED-3005-3','Atorvastatin Calcium','Pfizer',35.00,'2026-09-12','BAT-A10',8,5),
(42,'Atorvastatin 10 mg','MED-3005-4','Atorvastatin Calcium','Pfizer',35.00,'2026-09-12','BAT-A10',8,5),
(43,'Cetirizine 10 mg','MED-3006-3','Cetirizine Dihydrochloride','Cipla',8.50,'2027-03-25','BAT-C10',9,5),
(44,'Cetirizine 10 mg','MED-3006-4','Cetirizine Dihydrochloride','Cipla',8.50,'2027-03-25','BAT-C10',9,5),
(45,'Pantoprazole 40 mg','MED-3007-3','Pantoprazole Sodium','Sun Pharma',22.00,'2026-10-18','BAT-P40',10,5),
(46,'Pantoprazole 40 mg','MED-3007-4','Pantoprazole Sodium','Sun Pharma',22.00,'2026-10-18','BAT-P40',10,5),
(47,'Amlodipine 5 mg','MED-3008-3','Amlodipine Besylate','Lupin',10.50,'2027-05-30','BAT-AM5',8,5),
(48,'Amlodipine 5 mg','MED-3008-4','Amlodipine Besylate','Lupin',10.50,'2027-05-30','BAT-AM5',8,5),
(49,'Azithromycin 500 mg','MED-3009-3','Azithromycin Dihydrate','Sandoz',45.00,'2026-12-05','BAT-AZ500',6,5),
(50,'Azithromycin 500 mg','MED-3009-4','Azithromycin Dihydrate','Sandoz',45.00,'2026-12-05','BAT-AZ500',6,5),
(51,'Losartan 50 mg','MED-3010-3','Losartan Potassium','Merck',28.00,'2027-04-14','BAT-L50',8,5),
(52,'Losartan 50 mg','MED-3010-4','Losartan Potassium','Merck',28.00,'2027-04-14','BAT-L50',8,5),
(53,'Omeprazole 20 mg','MED-3011-3','Omeprazole','AstraZeneca',14.00,'2027-02-28','BAT-O20',10,5),
(54,'Omeprazole 20 mg','MED-3011-4','Omeprazole','AstraZeneca',14.00,'2027-02-28','BAT-O20',10,5),
(55,'Ranitidine 150 mg','MED-3012-3','Ranitidine Hydrochloride','Glaxo',9.00,'2026-08-30','BAT-R150',10,5),
(56,'Ranitidine 150 mg','MED-3012-4','Ranitidine Hydrochloride','Glaxo',9.00,'2026-08-30','BAT-R150',10,5),
(57,'Ciprofloxacin 500 mg','MED-3013-3','Ciprofloxacin Hydrochloride','Bayer',32.00,'2026-10-22','BAT-CP500',6,5),
(58,'Ciprofloxacin 500 mg','MED-3013-4','Ciprofloxacin Hydrochloride','Bayer',32.00,'2026-10-22','BAT-CP500',6,5),
(59,'Aspirin 75 mg','MED-3014-3','Acetylsalicylic Acid','Bayer',6.00,'2027-09-01','BAT-ASP75',5,5),
(60,'Aspirin 75 mg','MED-3014-4','Acetylsalicylic Acid','Bayer',6.00,'2027-09-01','BAT-ASP75',5,5),
(61,'Albuterol Inhaler 90 mcg','MED-3015-3','Albuterol Sulfate','GSK',120.00,'2026-09-06','BAT-ALB90',11,5),
(62,'Albuterol Inhaler 90 mcg','MED-3015-4','Albuterol Sulfate','GSK',120.00,'2026-09-06','BAT-ALB90',11,5),
(63,'Paracetamol 650 mg','MED-3001-5','Paracetamol','GSK',15.50,'2027-06-15','BAT-P650',5,5),
(64,'Amoxicillin 500 mg','MED-3002-5','Amoxicillin Trihydrate','Alkem',25.00,'2026-11-20','BAT-A500',6,5),
(65,'Ibuprofen 400 mg','MED-3003-5','Ibuprofen','Abbott',18.00,'2027-01-10','BAT-I400',5,5),
(66,'Metformin 500 mg','MED-3004-5','Metformin Hydrochloride','Mankind',12.00,'2027-08-05','BAT-M500',7,5),
(67,'Atorvastatin 10 mg','MED-3005-5','Atorvastatin Calcium','Pfizer',35.00,'2026-09-12','BAT-A10',8,5),
(68,'Cetirizine 10 mg','MED-3006-5','Cetirizine Dihydrochloride','Cipla',8.50,'2027-03-25','BAT-C10',9,5),
(69,'Pantoprazole 40 mg','MED-3007-5','Pantoprazole Sodium','Sun Pharma',22.00,'2026-10-18','BAT-P40',10,5),
(70,'Amlodipine 5 mg','MED-3008-5','Amlodipine Besylate','Lupin',10.50,'2027-05-30','BAT-AM5',8,5),
(71,'Azithromycin 500 mg','MED-3009-5','Azithromycin Dihydrate','Sandoz',45.00,'2026-12-05','BAT-AZ500',6,5),
(72,'Losartan 50 mg','MED-3010-5','Losartan Potassium','Merck',28.00,'2027-04-14','BAT-L50',8,5),
(73,'Omeprazole 20 mg','MED-3011-5','Omeprazole','AstraZeneca',14.00,'2027-02-28','BAT-O20',10,5),
(74,'Ranitidine 150 mg','MED-3012-5','Ranitidine Hydrochloride','Glaxo',9.00,'2026-08-30','BAT-R150',10,5),
(75,'Ciprofloxacin 500 mg','MED-3013-5','Ciprofloxacin Hydrochloride','Bayer',32.00,'2026-10-22','BAT-CP500',6,5),
(76,'Aspirin 75 mg','MED-3014-5','Acetylsalicylic Acid','Bayer',6.00,'2027-09-01','BAT-ASP75',5,5),
(77,'Albuterol Inhaler 90 mcg','MED-3015-5','Albuterol Sulfate','GSK',120.00,'2026-09-06','BAT-ALB90',11,5);

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
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO inventory VALUES 
(1,1,100,15,500,'RACK-A1','2026-08-13 14:28:24'),
(2,2,80,20,400,'RACK-B2','2026-08-13 14:28:24'),
(3,3,0,10,100,NULL,'2026-08-13 15:06:29'),
(4,4,0,10,100,NULL,'2026-08-13 15:06:29'),
(5,5,0,10,100,NULL,'2026-08-13 15:06:29'),
(6,6,0,10,100,NULL,'2026-08-13 15:06:29'),
(7,7,0,10,100,NULL,'2026-08-13 15:06:29'),
(8,8,0,10,100,NULL,'2026-08-13 15:06:29'),
(9,9,0,10,100,NULL,'2026-08-13 15:06:29'),
(10,10,0,10,100,NULL,'2026-08-13 15:06:29'),
(11,11,0,10,100,NULL,'2026-08-13 15:06:29'),
(12,12,0,10,100,NULL,'2026-08-13 15:06:29'),
(13,13,0,10,100,NULL,'2026-08-13 15:06:29'),
(14,14,0,10,100,NULL,'2026-08-13 15:06:29'),
(15,15,0,10,100,NULL,'2026-08-13 15:06:29'),
(16,16,0,10,100,NULL,'2026-08-13 15:06:29'),
(17,17,0,10,100,NULL,'2026-08-13 15:06:29'),
(18,18,0,10,100,NULL,'2026-08-13 15:06:29'),
(19,19,0,10,100,NULL,'2026-08-13 15:06:29'),
(20,20,0,10,100,NULL,'2026-08-13 15:06:29'),
(21,21,0,10,100,NULL,'2026-08-13 15:06:29'),
(22,22,0,10,100,NULL,'2026-08-13 15:06:29'),
(23,23,0,10,100,NULL,'2026-08-13 15:06:29'),
(24,24,0,10,100,NULL,'2026-08-13 15:06:29'),
(25,25,0,10,100,NULL,'2026-08-13 15:06:29'),
(26,26,0,10,100,NULL,'2026-08-13 15:06:29'),
(27,27,0,10,100,NULL,'2026-08-13 15:06:29'),
(28,28,0,10,100,NULL,'2026-08-13 15:06:29'),
(29,29,0,10,100,NULL,'2026-08-13 15:06:29'),
(30,30,0,10,100,NULL,'2026-08-13 15:06:29'),
(31,31,0,10,100,NULL,'2026-08-13 15:06:29'),
(32,32,0,10,100,NULL,'2026-08-13 15:06:29'),
(33,33,0,10,100,NULL,'2026-08-13 17:25:08'),
(34,34,0,10,100,NULL,'2026-08-13 17:25:08'),
(35,35,0,10,100,NULL,'2026-08-13 17:25:08'),
(36,36,0,10,100,NULL,'2026-08-13 17:25:08'),
(37,37,0,10,100,NULL,'2026-08-13 17:25:09'),
(38,38,0,10,100,NULL,'2026-08-13 17:25:09'),
(39,39,0,10,100,NULL,'2026-08-13 17:25:09'),
(40,40,0,10,100,NULL,'2026-08-13 17:25:09'),
(41,41,0,10,100,NULL,'2026-08-13 17:25:09'),
(42,42,0,10,100,NULL,'2026-08-13 17:25:09'),
(43,43,0,10,100,NULL,'2026-08-13 17:25:09'),
(44,44,0,10,100,NULL,'2026-08-13 17:25:09'),
(45,45,0,10,100,NULL,'2026-08-13 17:25:09'),
(46,46,0,10,100,NULL,'2026-08-13 17:25:09'),
(47,47,0,10,100,NULL,'2026-08-13 17:25:09'),
(48,48,0,10,100,NULL,'2026-08-13 17:25:09'),
(49,49,0,10,100,NULL,'2026-08-13 17:25:09'),
(50,50,0,10,100,NULL,'2026-08-13 17:25:09'),
(51,51,0,10,100,NULL,'2026-08-13 17:25:09'),
(52,52,0,10,100,NULL,'2026-08-13 17:25:09'),
(53,53,0,10,100,NULL,'2026-08-13 17:25:09'),
(54,54,0,10,100,NULL,'2026-08-13 17:25:09'),
(55,55,0,10,100,NULL,'2026-08-13 17:25:09'),
(56,56,0,10,100,NULL,'2026-08-13 17:25:09'),
(57,57,0,10,100,NULL,'2026-08-13 17:25:09'),
(58,58,0,10,100,NULL,'2026-08-13 17:25:09'),
(59,59,0,10,100,NULL,'2026-08-13 17:25:09'),
(60,60,0,10,100,NULL,'2026-08-13 17:25:09'),
(61,61,0,10,100,NULL,'2026-08-13 17:25:09'),
(62,62,0,10,100,NULL,'2026-08-13 17:25:09'),
(63,63,0,10,100,NULL,'2026-08-14 05:44:13'),
(64,64,0,10,100,NULL,'2026-08-14 05:44:13'),
(65,65,0,10,100,NULL,'2026-08-14 05:44:13'),
(66,66,0,10,100,NULL,'2026-08-14 05:44:13'),
(67,67,0,10,100,NULL,'2026-08-14 05:44:13'),
(68,68,0,10,100,NULL,'2026-08-14 05:44:13'),
(69,69,0,10,100,NULL,'2026-08-14 05:44:13'),
(70,70,0,10,100,NULL,'2026-08-14 05:44:13'),
(71,71,0,10,100,NULL,'2026-08-14 05:44:13'),
(72,72,0,10,100,NULL,'2026-08-14 05:44:13'),
(73,73,0,10,100,NULL,'2026-08-14 05:44:13'),
(74,74,0,10,100,NULL,'2026-08-14 05:44:13'),
(75,75,0,10,100,NULL,'2026-08-14 05:44:13'),
(76,76,0,10,100,NULL,'2026-08-14 05:44:13'),
(77,77,0,10,100,NULL,'2026-08-14 05:44:13');

-- ==========================
-- SUPPLIER MEDICINES TABLE
-- ==========================
CREATE TABLE supplier_medicines (
    id BIGINT NOT NULL AUTO_INCREMENT,
    available_quantity INT NOT NULL,
    supplier_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    generic_name VARCHAR(100),
    manufacturer VARCHAR(100),
    price DECIMAL(10,2),
    expiry_date DATE,
    batch_number VARCHAR(50),
    category_id BIGINT,
    PRIMARY KEY(id),
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Dynamic Supplier ID resolution variables
SET @sharma_sup_id = (SELECT id FROM suppliers WHERE user_id = (SELECT id FROM users WHERE username = 'Sharma'));
SET @supplier2_sup_id = (SELECT id FROM suppliers WHERE user_id = (SELECT id FROM users WHERE username = 'Supplier2'));

-- Seed Apollo Pharma's Paracetamol medicine in supplier_medicines for PO 1 matching Paracetamol (id = 1)
INSERT INTO supplier_medicines (id, available_quantity, supplier_id, name, code, generic_name, manufacturer, price, expiry_date, batch_number, category_id)
VALUES (1, 500, 1, 'Paracetamol', 'MED-PCM-500', 'Paracetamol 500mg', 'Cipla Ltd', 25.50, '2028-06-30', 'PCM2026A', 1);

-- Seed Supplier 1 (Sharma) independent catalogue (77 medicines copied from medicines table)
INSERT INTO supplier_medicines (available_quantity, supplier_id, name, code, generic_name, manufacturer, price, expiry_date, batch_number, category_id)
SELECT 100, @sharma_sup_id, name, code, generic_name, manufacturer, price, expiry_date, batch_number, category_id
FROM medicines;

-- Seed Supplier 2 (Supplier2) independent catalogue (60 medicines derived from medicines table)
INSERT INTO supplier_medicines (available_quantity, supplier_id, name, code, generic_name, manufacturer, price, expiry_date, batch_number, category_id)
SELECT 200, @supplier2_sup_id, name, CONCAT(code, '-SUP2'), generic_name, manufacturer, price + 5.00, expiry_date, batch_number, category_id
FROM medicines
LIMIT 60;

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
    FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO purchase_orders (id,order_number,supplier_id,user_id,status,total_amount,order_date) VALUES
(1, 'PO-2026-001', 1, 1, 'APPROVED', 2550.00, '2026-07-30 19:21:08');

-- ==========================
-- PURCHASE ORDER ITEMS TABLE
-- ==========================
CREATE TABLE purchase_order_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    purchase_order_id BIGINT NOT NULL,
    supplier_medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    PRIMARY KEY(id),
    FOREIGN KEY(purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY(supplier_medicine_id) REFERENCES supplier_medicines(id)
) ENGINE=InnoDB;

INSERT INTO purchase_order_items (id,purchase_order_id,supplier_medicine_id,quantity,unit_price,total_price) VALUES
(1, 1, 1, 100, 25.50, 2550.00);

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
    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
) ENGINE=InnoDB;

INSERT INTO batches (id,medicine_id,batch_no,mfg_date,expiry_date) VALUES
(1, 1, 'PCM2026A', '2026-01-01', '2028-06-30');

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
    FOREIGN KEY(batch_id) REFERENCES batches(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
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
    FOREIGN KEY(user_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO notifications (id,user_id,type,message,is_read) VALUES
(1, 1, 'Stock', 'Paracetamol Stock Added', 0);

-- ==========================
-- SALES TABLE
-- ==========================
CREATE TABLE sales (
    id BIGINT NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(20),
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    final_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================
-- SALE ITEMS TABLE
-- ==========================
CREATE TABLE sale_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sale_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY(medicine_id) REFERENCES medicines(id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;