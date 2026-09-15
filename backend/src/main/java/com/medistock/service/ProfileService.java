package com.medistock.service;

import com.medistock.dto.ChangePasswordRequest;
import com.medistock.dto.ProfileResponse;
import com.medistock.dto.UpdateProfileRequest;
import com.medistock.model.User;
import com.medistock.repository.UserRepository;
import com.medistock.security.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Self-service profile management (requirement 22). Deliberately narrow:
 * a user can change their own name and password, but never their own role
 * or active status — those only change through Admin User Management
 * (UserManagementController), which is a completely separate, Admin-only
 * code path. There is no method here that accepts a role or active flag.
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserProvider currentUserProvider;
    private final UserActivityService userActivityService;

    public ProfileResponse getMyProfile() {
        User user = requireCurrentUser();
        return ProfileResponse.from(user);
    }

    @Transactional
    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User user = requireCurrentUser();
        user.setFullName(request.getFullName());
        user = userRepository.save(user);
        userActivityService.log(user, "PROFILE_UPDATED", "Updated profile details");
        return ProfileResponse.from(user);
    }

    @Transactional
    public void changeMyPassword(ChangePasswordRequest request) {
        User user = requireCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        userActivityService.log(user, "PASSWORD_CHANGED", "Changed their own password");
    }

    private User requireCurrentUser() {
        User user = currentUserProvider.getCurrentUser();
        if (user == null) {
            throw new AccessDeniedException("You must be signed in.");
        }
        return userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
