package com.medistock.user.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.profile.dto.response.UserProfileResponse;
import com.medistock.role.entity.Role;
import com.medistock.role.repository.RoleRepository;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.user.dto.request.CreateUserRequest;
import com.medistock.user.dto.request.AdminUpdateUserRequest;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import com.medistock.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
    public UserProfileResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        String roleName = (request.getRole() != null && !request.getRole().isBlank()) 
                ? request.getRole().toUpperCase().replace("ROLE_", "") 
                : "USER";

        Role assignedRole = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(roleName)
                        .description(roleName + " Role")
                        .build()));

        boolean isEmployee = !roleName.equalsIgnoreCase("USER");
        String autoEmpId = null;
        if (isEmployee) {
            String empPrefix = roleName.contains("ADMIN") ? "ADM" : roleName.contains("PHARMACIST") ? "PHA" : "STF";
            long nextId = userRepository.count() + 1;
            autoEmpId = String.format("%s%03d", empPrefix, nextId);
        }

        User user = User.builder()
                .employeeId(autoEmpId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .enabled(true)
                .accountNonLocked(true)
                .roles(new HashSet<>(Collections.singletonList(assignedRole)))
                .build();

        User savedUser = userRepository.save(user);
        return mapToProfileResponse(savedUser);
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

            // Handle Employee ID on role promotion / demotion
            String primaryRole = request.getRoles().stream().findFirst().orElse("USER").toUpperCase();
            boolean isNowEmployee = primaryRole.contains("ADMIN") || primaryRole.contains("PHARMACIST") || primaryRole.contains("STAFF");
            if (isNowEmployee) {
                if (user.getEmployeeId() == null || user.getEmployeeId().isBlank()) {
                    String prefix = primaryRole.contains("ADMIN") ? "ADM" : primaryRole.contains("PHARMACIST") ? "PHA" : "STF";
                    user.setEmployeeId(String.format("%s%03d", prefix, user.getId()));
                }
            } else {
                user.setEmployeeId(null);
            }
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

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, String>> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> Map.of(
                        "id", String.valueOf(r.getId()),
                        "name", r.getName(),
                        "description", r.getDescription() != null ? r.getDescription() : ""
                ))
                .collect(Collectors.toList());
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
