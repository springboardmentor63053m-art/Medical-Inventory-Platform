package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.dto.JwtResponse;
import com.medistock.medistockbackend.dto.LoginRequest;
import com.medistock.medistockbackend.dto.MessageResponse;
import com.medistock.medistockbackend.dto.RegisterRequest;
import com.medistock.medistockbackend.entity.AccountStatus;
import com.medistock.medistockbackend.entity.Role;
import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.RoleRepository;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.security.JwtUtils;
import com.medistock.medistockbackend.security.UserDetailsImpl;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getUsername(),
                                loginRequest.getPassword()
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles =
                userDetails.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(
                new JwtResponse(
                        jwt,
                        userDetails.getId(),
                        userDetails.getUsername(),
                        userDetails.getEmail(),
                        roles
                )
        );
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterRequest signUpRequest) {

        // -----------------------------------------------------
        // Check username
        // -----------------------------------------------------

        if (userRepository.existsByUsername(
                signUpRequest.getUsername())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    "Error: Username is already taken!"
                            )
                    );
        }

        // -----------------------------------------------------
        // Check email
        // -----------------------------------------------------

        if (userRepository.existsByEmail(
                signUpRequest.getEmail())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    "Error: Email is already in use!"
                            )
                    );
        }

        // -----------------------------------------------------
        // Get requested role
        // -----------------------------------------------------

        String requestedRole = signUpRequest.getRole();

        if (requestedRole == null ||
                requestedRole.trim().isEmpty()) {

            requestedRole = "ROLE_USER";
        }

        requestedRole =
                requestedRole.trim().toUpperCase();

        // -----------------------------------------------------
        // Prevent Admin registration
        // -----------------------------------------------------

        if (requestedRole.equals("ADMIN") ||
                requestedRole.equals("ROLE_ADMIN")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    "Error: Admin accounts cannot be created through public registration."
                            )
                    );
        }

        // -----------------------------------------------------
        // Allowed registration roles
        // -----------------------------------------------------

        if (!requestedRole.equals("ROLE_USER") &&
                !requestedRole.equals("ROLE_STAFF") &&
                !requestedRole.equals("ROLE_PHARMACIST") &&
                !requestedRole.equals("ROLE_SUPPLIER")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    "Error: Invalid registration role."
                            )
                    );
        }

        // -----------------------------------------------------
        // Find role
        // -----------------------------------------------------

        Role userRole =
                roleRepository
                        .findByName(requestedRole)
                        .orElse(null);

        if (userRole == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    "Error: Role is not found: "
                                            + requestedRole
                            )
                    );
        }

        // -----------------------------------------------------
        // Create user
        // -----------------------------------------------------

        User user = new User();

        user.setUsername(
                signUpRequest.getUsername()
        );

        user.setEmail(
                signUpRequest.getEmail()
        );

        // IMPORTANT:
        // Password is converted to BCrypt before saving.
        user.setPassword(
                encoder.encode(
                        signUpRequest.getPassword()
                )
        );

        // -----------------------------------------------------
        // Phone
        // -----------------------------------------------------

        if (signUpRequest.getPhone() != null &&
                !signUpRequest.getPhone().trim().isEmpty()) {

            user.setPhone(
                    signUpRequest.getPhone()
            );
        }

        // -----------------------------------------------------
        // Role
        // -----------------------------------------------------

        user.setRole(userRole);

        // -----------------------------------------------------
        // Account status
        // -----------------------------------------------------

        user.setAccountStatus(
                AccountStatus.APPROVED
        );

        // -----------------------------------------------------
        // Save user
        // -----------------------------------------------------

        userRepository.save(user);

        // -----------------------------------------------------
        // Success message
        // -----------------------------------------------------

        String roleMessage;

        switch (requestedRole) {

            case "ROLE_STAFF":
                roleMessage =
                        "Staff account created successfully!";
                break;

            case "ROLE_PHARMACIST":
                roleMessage =
                        "Pharmacist account created successfully!";
                break;

            case "ROLE_SUPPLIER":
                roleMessage =
                        "Supplier account created successfully!";
                break;

            default:
                roleMessage =
                        "User account created successfully!";
                break;
        }

        return ResponseEntity.ok(
                new MessageResponse(roleMessage)
        );
    }

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder encoder,
            JwtUtils jwtUtils) {

        this.authenticationManager =
                authenticationManager;

        this.userRepository =
                userRepository;

        this.roleRepository =
                roleRepository;

        this.encoder =
                encoder;

        this.jwtUtils =
                jwtUtils;
    }
}