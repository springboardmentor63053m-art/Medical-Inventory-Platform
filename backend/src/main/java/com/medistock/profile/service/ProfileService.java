package com.medistock.profile.service;

import com.medistock.profile.dto.request.ChangePasswordRequest;
import com.medistock.profile.dto.request.UpdateProfileRequest;
import com.medistock.profile.dto.response.UserProfileResponse;

public interface ProfileService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}
