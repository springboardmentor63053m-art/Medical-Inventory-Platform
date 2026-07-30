package com.medistock.authentication.controller;

import com.medistock.authentication.dto.request.LoginRequest;
import com.medistock.authentication.dto.request.RegisterRequest;
import com.medistock.authentication.dto.response.AuthResponse;
import com.medistock.authentication.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medistock.authentication.dto.request.ForgotPasswordRequest;
import com.medistock.authentication.dto.request.RefreshTokenRequest;
import com.medistock.authentication.dto.request.ResetPasswordRequest;
import com.medistock.authentication.service.PasswordResetService;
import com.medistock.common.security.jwt.JwtService;
import org.springframework.security.core.Authentication;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Map<String, String> result = passwordResetService.forgotPassword(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Map<String, String> result = passwordResetService.resetPassword(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(@RequestParam String token) {
        boolean valid = passwordResetService.validateResetToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        boolean valid = jwtService.isTokenValid(token);
        String username = valid ? jwtService.extractUsername(token) : null;
        return ResponseEntity.ok(Map.of("valid", valid, "username", username != null ? username : ""));
    }
}
