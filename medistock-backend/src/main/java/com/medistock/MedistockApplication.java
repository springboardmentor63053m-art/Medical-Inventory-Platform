package com.medistock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedistockApplication {

    private static final Logger log = LoggerFactory.getLogger(MedistockApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(MedistockApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady(ApplicationReadyEvent event) {
        Environment env = event.getApplicationContext().getEnvironment();
        String port = env.getProperty("server.port", "8081");
        String contextPath = env.getProperty("server.servlet.context-path", "");

        String baseUrl = "http://localhost:" + port + contextPath;
        String swaggerUrl = baseUrl + "/swagger-ui.html";

        log.info("\n----------------------------------------------------------\n\t" +
                "MediStock Application is running!\n\t" +
                "Access URLs:\n\t" +
                "Local App: \t{}\n\t" +
                "Swagger UI: \t{}\n\t" +
                "OpenAPI Spec:\t{}/api-docs\n" +
                "----------------------------------------------------------",
                baseUrl, swaggerUrl, baseUrl);
    }
}

