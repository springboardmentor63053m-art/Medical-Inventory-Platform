package com.medistock.authentication.service.impl;

import com.medistock.authentication.dto.request.LoginRequest;
import com.medistock.authentication.dto.request.RegisterRequest;
import com.medistock.authentication.dto.response.AuthResponse;
import com.medistock.authentication.service.AuthService;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.common.security.jwt.JwtService;
import com.medistock.common.security.principal.UserPrincipal;
import com.medistock.role.entity.Role;
import com.medistock.role.repository.RoleRepository;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        String targetRole = request.getEmail().toLowerCase().contains("admin") ? "ADMIN" :
                            request.getEmail().toLowerCase().contains("pharmacist") ? "PHARMACIST" : "STAFF";

        Role defaultRole = roleRepository.findByName(targetRole)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(targetRole)
                        .description(targetRole + " Role")
                        .build()));

        String empIdPrefix = targetRole.equals("ADMIN") ? "ADM" : targetRole.equals("PHARMACIST") ? "PHA" : "EMP";
        long count = userRepository.count() + 1;
        String autoEmpId = String.format("%s%03d", empIdPrefix, count);

        User user = User.builder()
                .employeeId(autoEmpId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .enabled(true)
                .accountNonLocked(true)
                .roles(new HashSet<>(Collections.singletonList(defaultRole)))
                .lastLogin(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String jwtToken = jwtService.generateToken(userPrincipal);

        List<String> roleNames = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(savedUser.getId())
                .employeeId(savedUser.getEmployeeId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .roles(roleNames)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        // Update last login timestamp & assign employeeId if missing
        if (user.getEmployeeId() == null || user.getEmployeeId().isEmpty()) {
            String roleName = user.getRoles().stream().map(Role::getName).findFirst().orElse("STAFF");
            String prefix = roleName.contains("ADMIN") ? "ADM" : roleName.contains("PHARMACIST") ? "PHA" : "EMP";
            user.setEmployeeId(String.format("%s%03d", prefix, user.getId()));
        }
        user.setLastLogin(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        UserPrincipal updatedPrincipal = UserPrincipal.create(updatedUser);
        String jwtToken = jwtService.generateToken(updatedPrincipal);

        List<String> roles = updatedPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(updatedUser.getId())
                .employeeId(updatedUser.getEmployeeId())
                .email(updatedUser.getEmail())
                .firstName(updatedUser.getFirstName())
                .lastName(updatedUser.getLastName())
                .roles(roles)
                .build();
    }
}
