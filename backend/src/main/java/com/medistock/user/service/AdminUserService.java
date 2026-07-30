package com.medistock.user.service;

import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.user.dto.request.AdminUpdateUserRequest;

import java.util.List;

public interface AdminUserService {
    List<UserProfileResponse> getAllUsers();
    UserProfileResponse getUserById(Long id);
    UserProfileResponse updateUser(Long id, AdminUpdateUserRequest request);
    void deleteUser(Long id);
}
