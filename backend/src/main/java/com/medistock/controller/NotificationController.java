package com.medistock.controller;

import com.medistock.dto.NotificationResponse;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMine() {
        String role = currentRole();
        return ResponseEntity.ok(notificationService.getForRole(role));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        String role = currentRole();
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCountForRole(role)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllReadForRole(currentRole());
        return ResponseEntity.noContent().build();
    }

    private String currentRole() {
        var user = currentUserProvider.getCurrentUser();
        return user != null ? user.getRole().name() : "STAFF";
    }
}
