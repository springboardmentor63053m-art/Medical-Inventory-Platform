package com.medistock.medistockbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "<h1>Welcome to the Medical Inventory Management System API!</h1>" +
               "<p>The backend is running perfectly.</p>" +
               "<p>View the API Documentation here: <a href='/swagger-ui/index.html'>Swagger UI</a></p>";
    }
}
