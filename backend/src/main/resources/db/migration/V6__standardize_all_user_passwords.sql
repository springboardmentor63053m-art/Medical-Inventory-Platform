-- Flyway Migration V6: Standardize all user passwords to Password@123

UPDATE users SET password = '$2a$10$/jhbds9p7DPJ8H/RjRHesOUI1NN7Ong6h9CnowaPXk1HH3zpqoMeG';
