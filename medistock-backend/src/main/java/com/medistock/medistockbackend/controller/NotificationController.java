package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.Notification;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final UserRepository userRepository;

    public NotificationController(final NotificationService service, final UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@RequestParam(required = false) Long userId,
                                                     @RequestParam(required = false) String role) {
        if (userId != null) {
            return ResponseEntity.ok(service.findByUserId(userId));
        }
        if (role != null && !role.trim().isEmpty()) {
            return ResponseEntity.ok(service.findByRoleName(role));
        }

        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User authUser = userRepository.findByUsername(username).orElse(null);
                if (authUser != null && authUser.getRole() != null) {
                    String userRole = authUser.getRole().getName();
                    if ("ROLE_SUPPLIER".equalsIgnoreCase(userRole) || "SUPPLIER".equalsIgnoreCase(userRole)) {
                        return ResponseEntity.ok(service.findByUserId(authUser.getId()));
                    }
                }
            }
        } catch (Exception e) {
            // fallback
        }

        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> update(@PathVariable Long id, @RequestBody Notification entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(service.markAsRead(id));
    }
}
