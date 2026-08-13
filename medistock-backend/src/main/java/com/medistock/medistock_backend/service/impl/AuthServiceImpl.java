package com.medistock.medistock_backend.service.impl;

import com.medistock.medistock_backend.dto.JwtResponse;
import com.medistock.medistock_backend.dto.LoginRequest;
import com.medistock.medistock_backend.dto.RegisterRequest;
import com.medistock.medistock_backend.dto.UserDto;
import com.medistock.medistock_backend.dto.ChangePasswordRequest;
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

import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.repository.SupplierRepository;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SupplierRepository supplierRepository;
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

        if (requestedRoles.contains(ERole.ROLE_ADMIN)) {
            if (userRepository.existsByRoles_Name(ERole.ROLE_ADMIN)) {
                throw new BadRequestException("Admin account already exists. Only one Admin is allowed.");
            }
        }

        for (ERole eRole : requestedRoles) {
            Role role = roleRepository.findByName(eRole)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(eRole).build()));
            roles.add(role);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        if (requestedRoles.contains(ERole.ROLE_SUPPLIER)) {
            String supplierName = registerRequest.getFullName() != null && !registerRequest.getFullName().isBlank()
                    ? registerRequest.getFullName()
                    : registerRequest.getUsername();

            Optional<Supplier> existingSupplierOpt = Optional.empty();
            if (registerRequest.getEmail() != null && !registerRequest.getEmail().isBlank()) {
                existingSupplierOpt = supplierRepository.findByEmail(registerRequest.getEmail());
            }
            if (existingSupplierOpt.isEmpty() && supplierName != null) {
                List<Supplier> byName = supplierRepository.findByNameContainingIgnoreCase(supplierName);
                if (!byName.isEmpty()) {
                    existingSupplierOpt = Optional.of(byName.get(0));
                }
            }

            if (existingSupplierOpt.isPresent()) {
                Supplier existing = existingSupplierOpt.get();
                existing.setUser(savedUser);
                if (registerRequest.getPhone() != null && !registerRequest.getPhone().isBlank()) {
                    existing.setPhone(registerRequest.getPhone());
                }
                if (registerRequest.getAddress() != null && !registerRequest.getAddress().isBlank()) {
                    existing.setAddress(registerRequest.getAddress());
                }
                supplierRepository.save(existing);
            } else {
                Supplier supplier = Supplier.builder()
                        .name(supplierName)
                        .contactPerson(registerRequest.getFullName())
                        .email(registerRequest.getEmail())
                        .phone(registerRequest.getPhone())
                        .address(registerRequest.getAddress())
                        .user(savedUser)
                        .build();
                supplierRepository.save(supplier);
            }
        }

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
            if (!normalizedRole.equals("ROLE_PHARMACIST") && !normalizedRole.equals("ROLE_STAFF") && !normalizedRole.equals("ROLE_SUPPLIER")) {
                throw new BadRequestException("Only pharmacist, staff, and supplier roles are allowed for registration.");
            }
            resolvedRoles.add(ERole.valueOf(normalizedRole));
        }

        return resolvedRoles;
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.medistock.medistock_backend.exception.ResourceNotFoundException("User not found: " + username));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
