package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.NotificationCountDto;
import com.medistock.medistock_backend.dto.NotificationDto;
import com.medistock.medistock_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications() {
        List<NotificationDto> notifications = notificationService.getNotificationsForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_STAFF', 'ROLE_SUPPLIER')")
    public ResponseEntity<ApiResponse<NotificationCountDto>> getNotificationCount() {
        NotificationCountDto countDto = notificationService.getNotificationCountForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Notification count retrieved successfully", countDto));
    }
}
