package com.medistock.medistock_backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;

// Seed runner is disabled as all initial data has been consolidated in Medistock.sql
@RequiredArgsConstructor
@Slf4j
public class SeedSupplierMedicinesRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        log.info("SeedSupplierMedicinesRunner is disabled.");
    }
}
