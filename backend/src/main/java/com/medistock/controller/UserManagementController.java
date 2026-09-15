package com.medistock.controller;

import com.medistock.dto.ChangeUserRoleRequest;
import com.medistock.dto.UserSummaryResponse;
import com.medistock.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Admin-only user directory: list/search/filter, activate/deactivate, change role (requirement 23). */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userManagementService.list(role, search));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserSummaryResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.setActive(id, true));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserSummaryResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.setActive(id, false));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserSummaryResponse> changeRole(
            @PathVariable Long id, @Valid @RequestBody ChangeUserRoleRequest request) {
        return ResponseEntity.ok(userManagementService.changeRole(id, request.getRole()));
    }
}
