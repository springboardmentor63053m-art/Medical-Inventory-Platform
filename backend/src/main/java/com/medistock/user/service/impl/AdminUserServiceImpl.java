package com.medistock.user.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.role.entity.Role;
import com.medistock.role.repository.RoleRepository;
import com.medistock.user.dto.request.AdminUpdateUserRequest;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import com.medistock.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getAccountNonLocked() != null) {
            user.setAccountNonLocked(request.getAccountNonLocked());
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> updatedRoles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder()
                                .name(roleName)
                                .description(roleName + " Enterprise Role")
                                .build()));
                updatedRoles.add(role);
            }
            user.setRoles(updatedRoles);
        }

        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
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
