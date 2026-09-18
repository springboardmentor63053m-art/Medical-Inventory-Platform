package com.medicalinventory.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Set test secret (256-bit base64 safe) and expiration (1 hour)
        ReflectionTestUtils.setField(jwtUtil, "secret", "MedicalInventoryManagementPlatformSecretKey2024BtechProjectSecure256BitKey");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L);

        userDetails = new User("admin", "password", Collections.emptyList());
    }

    @Test
    @DisplayName("Should generate valid JWT token and extract correct username")
    void testGenerateTokenAndExtractUsername() {
        String token = jwtUtil.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isBlank());

        String username = jwtUtil.extractUsername(token);
        assertEquals("admin", username);
        assertTrue(jwtUtil.validateToken(token));
        assertTrue(jwtUtil.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("Should generate token with custom extra claims")
    void testGenerateTokenWithExtraClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_ADMIN");
        claims.put("userId", 101L);

        String token = jwtUtil.generateToken(claims, userDetails);
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));

        String role = jwtUtil.extractClaim(token, c -> c.get("role", String.class));
        assertEquals("ROLE_ADMIN", role);
    }

    @Test
    @DisplayName("Should reject tampered or invalid JWT token")
    void testValidateInvalidToken() {
        String invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature";
        assertFalse(jwtUtil.validateToken(invalidToken));
        assertFalse(jwtUtil.validateToken(""));
        assertFalse(jwtUtil.validateToken(null));
    }

    @Test
    @DisplayName("Should detect expired token correctly")
    void testTokenExpiration() {
        // Create instance with 0ms expiration
        JwtUtil expiredJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(expiredJwtUtil, "secret", "MedicalInventoryManagementPlatformSecretKey2024BtechProjectSecure256BitKey");
        ReflectionTestUtils.setField(expiredJwtUtil, "expiration", -1000L);

        String token = expiredJwtUtil.generateToken(userDetails);
        assertFalse(expiredJwtUtil.validateToken(token));
    }
}
