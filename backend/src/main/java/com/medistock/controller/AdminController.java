package com.medistock.controller;

import com.medistock.dto.ActiveUsersSummary;
import com.medistock.dto.AuthResponse;
import com.medistock.dto.RegisterRequest;
import com.medistock.dto.SupplierLoginRequest;
import com.medistock.model.Role;
import com.medistock.model.UserActivityLog;
import com.medistock.service.ActiveUserTrackingService;
import com.medistock.service.AuthService;
import com.medistock.service.UserActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Admin-only endpoints: user activity analytics + supplier login provisioning. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserActivityService userActivityService;
    private final AuthService authService;
    private final ActiveUserTrackingService activeUserTrackingService;

    @GetMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserActivityLog>> getUserActivity() {
        return ResponseEntity.ok(userActivityService.getAll());
    }

    /** Who's logged in right now, broken down by role — see requirements 3 and 24. */
    @GetMapping("/active-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ActiveUsersSummary> getActiveUsers() {
        return ResponseEntity.ok(activeUserTrackingService.getSummary());
    }

    /**
     * Creates a login for an existing supplier record so that supplier can
     * sign in and see their own Supplier dashboard (profile, supplied
     * medicines, purchase/order activity — nothing else). Supplier logins
     * are provisioned by an admin rather than self-registered, since they
     * must be linked to a specific, already-existing supplier.
     */
    @PostMapping("/suppliers/{supplierId}/create-login")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createSupplierLogin(
            @PathVariable Long supplierId, @Valid @RequestBody SupplierLoginRequest request) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFullName(request.getFullName());
        registerRequest.setEmail(request.getEmail());
        registerRequest.setPassword(request.getPassword());
        registerRequest.setRole(Role.SUPPLIER);
        registerRequest.setSupplierId(supplierId);
        return ResponseEntity.ok(authService.registerSupplierAccount(registerRequest, supplierId));
    }
}
