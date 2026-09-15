package com.medistock.service;

import com.medistock.dto.UserSummaryResponse;
import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.UserRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Admin-only user management (requirement 23). Every mutating method here
 * enforces the "single Admin cannot be locked out of the system" rule:
 * MediStock's single-Admin design means deactivating or demoting the last
 * ADMIN account would leave the system with no one able to undo it, so
 * both are blocked server-side regardless of what the client sends. This
 * mirrors the register()/registerSupplierAccount() split in AuthService —
 * privileged mutations are never trusted to a client-supplied value alone.
 */
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    private final ActiveUserTrackingService activeUserTrackingService;
    private final UserActivityService userActivityService;

    private static final long INACTIVITY_TIMEOUT_MINUTES = 15;

    public List<UserSummaryResponse> list(String role, String search) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(INACTIVITY_TIMEOUT_MINUTES);
        return userRepository.findAll().stream()
                .filter(u -> role == null || role.isBlank() || u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> search == null || search.isBlank()
                        || u.getFullName().toLowerCase().contains(search.toLowerCase())
                        || u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .map(u -> UserSummaryResponse.from(u,
                        u.isSessionActive() && u.getLastActivityAt() != null && u.getLastActivityAt().isAfter(cutoff)))
                .toList();
    }

    @Transactional
    public UserSummaryResponse setActive(Long userId, boolean active) {
        User user = getById(userId);
        User currentUser = currentUserProvider.getCurrentUser();
        if (!active && currentUser != null && currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot deactivate your own account.");
        }
        if (!active && user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot deactivate the last remaining Admin account.");
        }
        user.setActive(active);
        if (!active) {
            activeUserTrackingService.recordLogout(user); // also force them offline
        }
        user = userRepository.save(user);
        logAdminAction(active ? "USER_ACTIVATED" : "USER_DEACTIVATED", user);
        return UserSummaryResponse.from(user, false);
    }

    @Transactional
    public UserSummaryResponse changeRole(Long userId, Role newRole) {
        User user = getById(userId);
        User currentUser = currentUserProvider.getCurrentUser();
        if (currentUser != null && currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot change your own role.");
        }
        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN
                && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot change the role of the last remaining Admin account.");
        }
        if (newRole == Role.ADMIN && user.getRole() != Role.ADMIN && userRepository.countByRole(Role.ADMIN) >= 1) {
            throw new IllegalArgumentException(
                    "MediStock supports exactly one Admin account. Deactivate or reassign the existing Admin first.");
        }
        if (newRole == Role.SUPPLIER && user.getSupplierId() == null) {
            throw new IllegalArgumentException(
                    "This account isn't linked to a supplier record. Use 'Create supplier login' instead of changing an existing user's role to Supplier.");
        }
        user.setRole(newRole);
        user = userRepository.save(user);
        logAdminAction("USER_ROLE_CHANGED", user);
        return UserSummaryResponse.from(user, false);
    }

    private User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    private void logAdminAction(String action, User target) {
        User admin = currentUserProvider.getCurrentUser();
        userActivityService.log(admin, action,
                (admin != null ? admin.getFullName() : "Admin") + " " + action.toLowerCase().replace('_', ' ')
                        + " for " + target.getEmail());
    }
}
