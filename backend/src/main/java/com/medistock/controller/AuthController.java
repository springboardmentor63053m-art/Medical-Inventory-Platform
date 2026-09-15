package com.medistock.controller;

import com.medistock.dto.AuthResponse;
import com.medistock.dto.ForgotPasswordRequest;
import com.medistock.dto.LoginRequest;
import com.medistock.dto.RegisterRequest;
import com.medistock.dto.ResetPasswordRequest;
import com.medistock.model.User;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;
    // Same detection pattern as SecurityConfig: only non-null once Google
    // OAuth2 credentials are actually configured.
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Resolves the profile for whoever the current JWT belongs to. Used by
     * the frontend's OAuth2 callback page, which only receives a bare token
     * on redirect (no name/role) and needs to hydrate the rest of the
     * session the same way a normal /login response would.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        User user = currentUserProvider.getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(AuthResponse.builder()
                .token(null)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .supplierId(user.getSupplierId())
                .build());
    }

    /**
     * Lets the frontend know whether Google OAuth2 login is actually
     * configured, so it can hide the "Continue with Google" button instead
     * of showing one that 404s. True only once GOOGLE_CLIENT_ID/SECRET are
     * set (see application.properties).
     */
    @GetMapping("/oauth2-status")
    public ResponseEntity<java.util.Map<String, Boolean>> oauth2Status() {
        boolean googleEnabled = clientRegistrationRepository.getIfAvailable() != null;
        return ResponseEntity.ok(java.util.Map.of("googleEnabled", googleEnabled));
    }

    /** Marks the current session offline and logs a LOGOUT activity entry. JWTs are stateless, so the client must still discard its token. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.noContent().build();
    }

    /**
     * Always responds with the same generic message, whether or not the
     * email is registered — never lets a caller distinguish "no such
     * account" from "reset link sent" (requirement 21).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message",
                "If an account exists for that email, we've sent password reset instructions."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully. You can now sign in."));
    }
}
