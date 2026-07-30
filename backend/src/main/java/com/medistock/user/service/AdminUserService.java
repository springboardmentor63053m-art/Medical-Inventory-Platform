package com.medistock.user.service;

import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.user.dto.request.AdminUpdateUserRequest;
import com.medistock.user.dto.request.CreateUserRequest;

import java.util.List;
import java.util.Map;

public interface AdminUserService {
    List<UserProfileResponse> getAllUsers();
    UserProfileResponse getUserById(Long id);
    UserProfileResponse createUser(CreateUserRequest request);
    UserProfileResponse updateUser(Long id, AdminUpdateUserRequest request);
    void deleteUser(Long id);
    List<Map<String, String>> getAllRoles();
}
