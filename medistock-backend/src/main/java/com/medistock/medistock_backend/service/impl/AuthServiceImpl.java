package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.JwtResponse;
import com.medistock.medistock_backend.dto.LoginRequest;
import com.medistock.medistock_backend.dto.RegisterRequest;
import com.medistock.medistock_backend.dto.UserDto;
import com.medistock.medistock_backend.entity.ERole;
import com.medistock.medistock_backend.entity.Role;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.exception.BadRequestException;
import com.medistock.medistock_backend.repository.RoleRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.security.JwtUtils;
import com.medistock.medistock_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        org.springframework.security.core.userdetails.User userDetails =
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String selectedRole = normalizeRoleName(loginRequest.getSelectedRole());
        boolean hasMatchingRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals(selectedRole));

        if (!hasMatchingRole) {
            throw new BadRequestException("Selected role does not match your account.");
        }

        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public UserDto register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .phone(registerRequest.getPhone())
                .active(true)
                .build();

        Set<Role> roles = new HashSet<>();
        Set<ERole> requestedRoles = resolveRequestedRoles(registerRequest.getRoles());

        for (ERole eRole : requestedRoles) {
            Role role = roleRepository.findByName(eRole)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(eRole).build()));
            roles.add(role);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        return UserDto.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .active(savedUser.isActive())
                .roles(savedUser.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new BadRequestException("Role is required");
        }

        String normalizedRole = roleName.trim().toUpperCase(Locale.ROOT);
        if (!normalizedRole.startsWith("ROLE_")) {
            normalizedRole = "ROLE_" + normalizedRole;
        }

        return normalizedRole;
    }

    private Set<ERole> resolveRequestedRoles(Set<String> requestedRoles) {
        Set<ERole> resolvedRoles = new HashSet<>();
        Set<String> incomingRoles = requestedRoles == null || requestedRoles.isEmpty()
                ? Set.of("ROLE_STAFF")
                : requestedRoles;

        if (incomingRoles.size() > 1) {
            throw new BadRequestException("Please select a single role for registration.");
        }

        for (String roleStr : incomingRoles) {
            String normalizedRole = normalizeRoleName(roleStr);
            if (!normalizedRole.equals("ROLE_PHARMACIST") && !normalizedRole.equals("ROLE_STAFF")) {
                throw new BadRequestException("Only pharmacist and staff roles are allowed for registration.");
            }
            resolvedRoles.add(ERole.valueOf(normalizedRole));
        }

        return resolvedRoles;
    }
}
