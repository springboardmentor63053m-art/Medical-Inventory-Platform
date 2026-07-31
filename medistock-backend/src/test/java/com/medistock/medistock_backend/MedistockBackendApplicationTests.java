package com.medistock.medistock_backend;

import com.medistock.medistock_backend.security.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class MedistockBackendApplicationTests {

    @Test
    @DisplayName("Verify BCrypt password encoding & seed hash matching")
    void testBCryptPasswordMatching() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String seedHash = "$2a$10$gGe0HQlds7Iogjn2/baUWuIV7TJL.MHiHd37Cjt7f9GJimaFjhfNS";
        
        assertTrue(encoder.matches(rawPassword, seedHash), "Admin seed password should match BCrypt hash");
    }

    @Test
    @DisplayName("Verify JWT token generation and username extraction")
    void testJwtUtils() {
        JwtUtils jwtUtils = new JwtUtils();
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        org.springframework.test.util.ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);

        String username = "admin";
        String token = jwtUtils.generateTokenFromUsername(username);

        assertNotNull(token, "JWT token should not be null");
        assertTrue(jwtUtils.validateJwtToken(token), "JWT token should be valid");
        assertEquals(username, jwtUtils.getUserNameFromJwtToken(token), "Extracted username should match");
    }
}
