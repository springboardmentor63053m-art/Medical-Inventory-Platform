package com.medistock.medistock_backend.security;

import com.medistock.medistock_backend.entity.*;
import com.medistock.medistock_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeedSupplierMedicinesRunner implements CommandLineRunner {

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierMedicineRepository supplierMedicineRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== DEBUG DATA ===");
        try {
            supplierRepository.findAll().forEach(s -> {
                log.info("SUPPLIER: id={}, name='{}', email='{}', userId={}", 
                         s.getId(), s.getName(), s.getEmail(), s.getUser() != null ? s.getUser().getId() : null);
            });
            userRepository.findAll().forEach(u -> {
                log.info("USER: id={}, username='{}', email='{}', fullName='{}'", 
                         u.getId(), u.getUsername(), u.getEmail(), u.getFullName());
            });
        } catch (Exception ex) {
            log.error("Error during debug logging", ex);
        }
        log.info("==================");

        log.info("Starting Supplier Medicine Seed Runner...");
        
        // Rename supplier "Ridhi Jena" to "Glenmark" in database
        List<Supplier> suppliersList = supplierRepository.findAll();
        for (Supplier s : suppliersList) {
            if ("Ridhi Jena".equalsIgnoreCase(s.getName()) || (s.getUser() != null && "Glenmark".equalsIgnoreCase(s.getUser().getUsername()))) {
                s.setName("Glenmark");
                supplierRepository.save(s);
            }
        }
        userRepository.findAll().forEach(u -> {
            if ("Ridhi Jena".equalsIgnoreCase(u.getFullName()) || "Glenmark".equalsIgnoreCase(u.getUsername())) {
                u.setFullName("Glenmark");
                userRepository.save(u);
            }
        });

        List<Supplier> suppliers = supplierRepository.findAll();
        if (suppliers.isEmpty()) {
            log.warn("No suppliers found in the database to seed medicines for.");
            return;
        }

        log.info("Found {} suppliers in the database. Seeding medicines...", suppliers.size());

        // Define 15 realistic medicines with different attributes
        SeedMedData[] data = new SeedMedData[] {
            new SeedMedData("Paracetamol 650 mg", "MED-3001", "Paracetamol", "GSK", new BigDecimal("15.50"), LocalDate.of(2027, 6, 15), "BAT-P650", "Analgesics", 400),
            new SeedMedData("Amoxicillin 500 mg", "MED-3002", "Amoxicillin Trihydrate", "Alkem", new BigDecimal("25.00"), LocalDate.of(2026, 11, 20), "BAT-A500", "Antibiotics", 300),
            new SeedMedData("Ibuprofen 400 mg", "MED-3003", "Ibuprofen", "Abbott", new BigDecimal("18.00"), LocalDate.of(2027, 1, 10), "BAT-I400", "Analgesics", 500),
            new SeedMedData("Metformin 500 mg", "MED-3004", "Metformin Hydrochloride", "Mankind", new BigDecimal("12.00"), LocalDate.of(2027, 8, 5), "BAT-M500", "Antidiabetics", 600),
            new SeedMedData("Atorvastatin 10 mg", "MED-3005", "Atorvastatin Calcium", "Pfizer", new BigDecimal("35.00"), LocalDate.of(2026, 9, 12), "BAT-A10", "Cardiovascular", 200),
            new SeedMedData("Cetirizine 10 mg", "MED-3006", "Cetirizine Dihydrochloride", "Cipla", new BigDecimal("8.50"), LocalDate.of(2027, 3, 25), "BAT-C10", "Antihistamines", 800),
            new SeedMedData("Pantoprazole 40 mg", "MED-3007", "Pantoprazole Sodium", "Sun Pharma", new BigDecimal("22.00"), LocalDate.of(2026, 10, 18), "BAT-P40", "Gastrointestinal", 350),
            new SeedMedData("Amlodipine 5 mg", "MED-3008", "Amlodipine Besylate", "Lupin", new BigDecimal("10.50"), LocalDate.of(2027, 5, 30), "BAT-AM5", "Cardiovascular", 450),
            new SeedMedData("Azithromycin 500 mg", "MED-3009", "Azithromycin Dihydrate", "Sandoz", new BigDecimal("45.00"), LocalDate.of(2026, 12, 5), "BAT-AZ500", "Antibiotics", 150),
            new SeedMedData("Losartan 50 mg", "MED-3010", "Losartan Potassium", "Merck", new BigDecimal("28.00"), LocalDate.of(2027, 4, 14), "BAT-L50", "Cardiovascular", 250),
            new SeedMedData("Omeprazole 20 mg", "MED-3011", "Omeprazole", "AstraZeneca", new BigDecimal("14.00"), LocalDate.of(2027, 2, 28), "BAT-O20", "Gastrointestinal", 700),
            new SeedMedData("Ranitidine 150 mg", "MED-3012", "Ranitidine Hydrochloride", "Glaxo", new BigDecimal("9.00"), LocalDate.of(2026, 8, 30), "BAT-R150", "Gastrointestinal", 900),
            new SeedMedData("Ciprofloxacin 500 mg", "MED-3013", "Ciprofloxacin Hydrochloride", "Bayer", new BigDecimal("32.00"), LocalDate.of(2026, 10, 22), "BAT-CP500", "Antibiotics", 180),
            new SeedMedData("Aspirin 75 mg", "MED-3014", "Acetylsalicylic Acid", "Bayer", new BigDecimal("6.00"), LocalDate.of(2027, 9, 1), "BAT-ASP75", "Analgesics", 1000),
            new SeedMedData("Albuterol Inhaler 90 mcg", "MED-3015", "Albuterol Sulfate", "GSK", new BigDecimal("120.00"), LocalDate.of(2026, 9, 6), "BAT-ALB90", "Respiratory", 120)
        };

        for (SeedMedData d : data) {
            // 1. Resolve Category
            Category category;
            Optional<Category> catOpt = categoryRepository.findByName(d.categoryName);
            if (catOpt.isPresent()) {
                category = catOpt.get();
            } else {
                category = Category.builder()
                        .name(d.categoryName)
                        .description("Category for " + d.categoryName)
                        .build();
                category = categoryRepository.save(category);
            }

            // 2. For each supplier, register / link the medicine
            for (Supplier supplier : suppliers) {
                // Determine a unique medicine code per supplier to avoid unique key constraint conflicts
                // if they are saved globally
                String uniqueCode = d.code + "-" + supplier.getId();
                
                Optional<Medicine> medOpt = medicineRepository.findByCode(uniqueCode);
                Medicine medicine;
                
                if (medOpt.isPresent()) {
                    medicine = medOpt.get();
                } else {
                    medicine = Medicine.builder()
                            .name(d.name)
                            .code(uniqueCode)
                            .genericName(d.genericName)
                            .manufacturer(d.manufacturer)
                            .price(d.price)
                            .expiryDate(d.expiryDate)
                            .batchNumber(d.batchNumber)
                            .category(category)
                            .supplier(supplier)
                            .supplierAvailableQuantity(d.availQty)
                            .build();

                    medicine = medicineRepository.save(medicine);

                    // Add admin inventory (0 quantity)
                    Inventory inventory = Inventory.builder()
                            .medicine(medicine)
                            .quantity(0)
                            .reorderLevel(10)
                            .maxQuantity(100)
                            .build();
                    inventoryRepository.save(inventory);
                    medicine.setInventory(inventory);
                }

                // Add supplier medicine mapping
                Optional<SupplierMedicine> mappingOpt = supplierMedicineRepository
                        .findBySupplierIdAndMedicineId(supplier.getId(), medicine.getId());
                
                if (mappingOpt.isEmpty()) {
                    SupplierMedicine mapping = SupplierMedicine.builder()
                            .supplier(supplier)
                            .medicine(medicine)
                            .availableQuantity(d.availQty)
                            .build();
                    supplierMedicineRepository.save(mapping);
                    log.info("Seeded medicine '{}' for supplier '{}' with qty {}", d.name, supplier.getName(), d.availQty);
                }
            }
        }
        log.info("Supplier Medicine Seed Runner completed successfully.");
    }

    private static class SeedMedData {
        String name;
        String code;
        String genericName;
        String manufacturer;
        BigDecimal price;
        LocalDate expiryDate;
        String batchNumber;
        String categoryName;
        int availQty;

        SeedMedData(String name, String code, String genericName, String manufacturer, BigDecimal price, LocalDate expiryDate, String batchNumber, String categoryName, int availQty) {
            this.name = name;
            this.code = code;
            this.genericName = genericName;
            this.manufacturer = manufacturer;
            this.price = price;
            this.expiryDate = expiryDate;
            this.batchNumber = batchNumber;
            this.categoryName = categoryName;
            this.availQty = availQty;
        }
    }
}
