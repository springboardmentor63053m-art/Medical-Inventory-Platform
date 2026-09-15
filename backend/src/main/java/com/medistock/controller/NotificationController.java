package com.medistock.controller;

import com.medistock.dto.NotificationResponse;
import com.medistock.model.User;
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
        return ResponseEntity.ok(notificationService.getForRole(currentRole(), currentUserId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCountForRole(currentRole(), currentUserId())));
    }

    /** Marks this notification read for the CURRENT user only — every other user targeted by it keeps seeing it as unread (requirement 17). */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id, currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllReadForRole(currentRole(), currentUserId());
        return ResponseEntity.noContent().build();
    }

    private String currentRole() {
        User user = currentUserProvider.getCurrentUser();
        return user != null ? user.getRole().name() : "STAFF";
    }

    private Long currentUserId() {
        User user = currentUserProvider.getCurrentUser();
        return user != null ? user.getId() : null;
    }
}
