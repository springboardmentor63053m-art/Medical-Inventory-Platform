package com.medistock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.medistock")
@EnableJpaRepositories(basePackages = "com.medistock")
public class MediStockApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediStockApplication.class, args);
    }
}
