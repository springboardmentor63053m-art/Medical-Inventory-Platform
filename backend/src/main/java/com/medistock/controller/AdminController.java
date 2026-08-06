package com.medistock.controller;

import com.medistock.model.UserActivityLog;
import com.medistock.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin-only endpoints: user activity analytics for the System Monitoring panel. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserActivityService userActivityService;

    @GetMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserActivityLog>> getUserActivity() {
        return ResponseEntity.ok(userActivityService.getAll());
    }
}
