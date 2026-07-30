package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.UserDto;
import com.medistock.medistock_backend.dto.UserRequest;
import com.medistock.medistock_backend.entity.ERole;
import com.medistock.medistock_backend.entity.Role;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import com.medistock.medistock_backend.repository.RoleRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserDto createUser(UserRequest userRequest) {
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .username(userRequest.getUsername())
                .email(userRequest.getEmail())
                .password(passwordEncoder.encode(userRequest.getPassword() != null ? userRequest.getPassword() : "Default@123"))
                .fullName(userRequest.getFullName())
                .phone(userRequest.getPhone())
                .active(userRequest.isActive())
                .roles(mapRoles(userRequest.getRoles()))
                .build();

        return mapToDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFullName(userRequest.getFullName());
        user.setPhone(userRequest.getPhone());
        user.setActive(userRequest.isActive());

        if (userRequest.getPassword() != null && !userRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        if (userRequest.getRoles() != null && !userRequest.getRoles().isEmpty()) {
            user.setRoles(mapRoles(userRequest.getRoles()));
        }

        return mapToDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .active(user.isActive())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    private Set<Role> mapRoles(Set<String> roleStrings) {
        Set<Role> roles = new HashSet<>();
        if (roleStrings == null || roleStrings.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(ERole.ROLE_USER).build()));
            roles.add(userRole);
        } else {
            for (String rStr : roleStrings) {
                ERole eRole;
                try {
                    eRole = ERole.valueOf(rStr.toUpperCase().startsWith("ROLE_") ? rStr.toUpperCase() : "ROLE_" + rStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    eRole = ERole.ROLE_USER;
                }
                ERole finalERole = eRole;
                Role role = roleRepository.findByName(eRole)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(finalERole).build()));
                roles.add(role);
            }
        }
        return roles;
    }
}
