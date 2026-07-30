package com.medistock.profile.controller;

import com.medistock.profile.dto.request.ChangePasswordRequest;
import com.medistock.profile.dto.request.UpdateProfileRequest;
import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        UserProfileResponse profile = profileService.getProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserProfileResponse updatedProfile = profileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        profileService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
