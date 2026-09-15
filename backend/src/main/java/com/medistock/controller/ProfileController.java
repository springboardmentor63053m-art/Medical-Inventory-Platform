package com.medistock.controller;

import com.medistock.dto.ChangePasswordRequest;
import com.medistock.dto.ProfileResponse;
import com.medistock.dto.UpdateProfileRequest;
import com.medistock.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Self-service profile endpoints (requirement 22): the signed-in user's own
 * name and password. Every method here resolves "which user" from the JWT
 * (CurrentUserProvider), never from a path/body parameter, so there is no
 * way to call this on someone else's account, and no role field is ever
 * accepted here — self-promotion is impossible through this controller.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changeMyPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}
