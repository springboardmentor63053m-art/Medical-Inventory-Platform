package com.medistock.profile.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.profile.dto.request.ChangePasswordRequest;
import com.medistock.profile.dto.request.UpdateProfileRequest;
import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.profile.service.ProfileService;
import com.medistock.role.entity.Role;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmailOrEmployeeId(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email or employee ID: " + email));
        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmailOrEmployeeId(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email or employee ID: " + email));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailOrEmployeeId(email, email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email or employee ID: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .enabled(user.getEnabled())
                .accountNonLocked(user.getAccountNonLocked())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
