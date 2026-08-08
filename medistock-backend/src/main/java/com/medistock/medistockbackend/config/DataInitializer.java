package com.medistock.medistockbackend.config;

import com.medistock.medistockbackend.entity.Role;
import com.medistock.medistockbackend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository, org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            if (roleRepository.findByName("ROLE_USER").isEmpty()) {
                Role userRole = new Role();
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);
            }
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                Role adminRole = new Role();
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);
            }
            // Seed default user
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            if (userCount != null && userCount == 0) {
                // Password is 'password' encoded with BCrypt
                jdbcTemplate.execute("INSERT INTO users (username, email, password, role_id) VALUES ('Nanthidha', 'nanthidha@example.com', '$2a$10$eO1Y3.T31Wl8gQnC3C7.V.X6F/.V7bO.r08rI5U57/hF5x7BwQ3q2', (SELECT id FROM roles WHERE name='ROLE_USER' LIMIT 1))");
            } else {
                jdbcTemplate.query("SELECT username, email FROM users", (rs, rowNum) -> {
                    System.out.println("USER IN DB: " + rs.getString("username") + " | " + rs.getString("email"));
                    return null;
                });
                
                // Force update the password for Nanthidha to 'password' just in case
                jdbcTemplate.execute("UPDATE users SET password = '$2a$10$eO1Y3.T31Wl8gQnC3C7.V.X6F/.V7bO.r08rI5U57/hF5x7BwQ3q2' WHERE username = 'Nanthidha'");
            }
            
            // Seed medicines and inventory
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM medicines", Integer.class);
            if (count != null && count == 0) {
                jdbcTemplate.execute("INSERT INTO medicines (name, price) VALUES ('Paracetamol', 10), ('Amoxicillin 500mg', 20), ('Cetirizine 10mg', 30), ('Ibuprofen', 40), ('Cough Syrup 100ml', 50)");
                jdbcTemplate.execute("INSERT INTO inventory (medicine_id, quantity, batch_number, expiry_date, minimum_stock) VALUES (1, 150, 'B1', '2027-01-01', 20), (2, 80, 'B2', '2026-08-10', 15), (3, 200, 'B3', '2026-08-25', 30), (4, 200, 'B4', '2027-01-01', 30), (5, 5, 'B5', '2026-07-15', 10)");
            }
        };
    }
}
