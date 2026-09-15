package com.medistock.service;

import com.medistock.dto.ActiveUserResponse;
import com.medistock.dto.ActiveUsersSummary;
import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * A user is considered ONLINE if they have an active session (logged in,
 * haven't explicitly logged out) AND their last request was within the
 * inactivity window below. This avoids permanently showing someone as
 * online if they closed the tab without logging out (requirement 24).
 */
@Service
@RequiredArgsConstructor
public class ActiveUserTrackingService {

    private static final long INACTIVITY_TIMEOUT_MINUTES = 15;

    private final UserRepository userRepository;

    @Transactional
    public void recordLogin(User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setLastLoginAt(now);
        user.setLastActivityAt(now);
        user.setSessionActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void recordLogout(User user) {
        user.setSessionActive(false);
        userRepository.save(user);
    }

    /** Called on every authenticated request (see JwtAuthFilter) to keep last-activity fresh. */
    @Transactional
    public void touch(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastActivityAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public ActiveUsersSummary getSummary() {
        List<User> users = userRepository.findAll();
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(INACTIVITY_TIMEOUT_MINUTES);

        Map<String, Long> byRole = new LinkedHashMap<>();
        for (Role role : Role.values()) {
            byRole.put(role.name(), 0L);
        }

        List<ActiveUserResponse> rows = users.stream()
                .map(u -> {
                    boolean online = u.isSessionActive() && u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(cutoff);
                    if (online) byRole.merge(u.getRole().name(), 1L, Long::sum);
                    return ActiveUserResponse.builder()
                            .userId(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .role(u.getRole().name())
                            .status(online ? "ONLINE" : "OFFLINE")
                            .lastLoginAt(u.getLastLoginAt())
                            .lastActivityAt(u.getLastActivityAt())
                            .build();
                })
                .sorted((a, b) -> {
                    // online users first, then most-recently-active
                    int statusCompare = a.getStatus().equals(b.getStatus()) ? 0 : (a.getStatus().equals("ONLINE") ? -1 : 1);
                    if (statusCompare != 0) return statusCompare;
                    if (a.getLastActivityAt() == null) return 1;
                    if (b.getLastActivityAt() == null) return -1;
                    return b.getLastActivityAt().compareTo(a.getLastActivityAt());
                })
                .toList();

        long totalActive = byRole.values().stream().mapToLong(Long::longValue).sum();

        return ActiveUsersSummary.builder()
                .totalActive(totalActive)
                .byRole(byRole)
                .users(rows)
                .build();
    }
}
