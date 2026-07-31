package com.medicalinventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Medical Inventory Management Platform
 * Main Spring Boot Application Entry Point
 *
 * @author Team MedInventory
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class MedicalInventoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalInventoryApplication.class, args);
    }
}
