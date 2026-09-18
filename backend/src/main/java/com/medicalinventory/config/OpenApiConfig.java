package com.medicalinventory.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI medicalInventoryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediStock Pro — Medical Inventory Management Platform API")
                        .description("REST API documentation for MediStock Pro. Features full CRUD for medicines, suppliers, inventory batch tracking, sales, purchase orders, prescription validation, and AI demand forecasting.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("MediStock Engineering Team")
                                .email("support@medicalinv.com")
                                .url("http://localhost:5173"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (without 'Bearer ' prefix). You can obtain this token from POST /api/auth/login.")));
    }
}
