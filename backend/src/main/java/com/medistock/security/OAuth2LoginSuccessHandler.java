package com.medistock.security;

import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * MediStock accounts are normally created by an Admin with an explicit role
 * (Admin / Pharmacist / Staff). A brand-new Google login has no such
 * assignment yet, so it's provisioned as STAFF (the most restricted role)
 * and an Admin can promote it afterwards from the Suppliers/Users tooling.
 * Existing accounts (matched by email) just get a fresh JWT — Google is
 * purely an alternate way to authenticate the same account.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
                User.builder()
                        .fullName(name != null ? name : email)
                        .email(email)
                        // Google-authenticated accounts don't use a local password;
                        // store a random, never-shared, bcrypt-hashed placeholder so
                        // the column constraint is satisfied and no one can guess it.
                        .password(new BCryptPasswordEncoder().encode(UUID.randomUUID().toString()))
                        .role(Role.STAFF)
                        .active(true)
                        .emailVerified(true)
                        .build()
        ));

        user.setLastLoginAt(LocalDateTime.now());
        user.setLastActivityAt(LocalDateTime.now());
        user.setSessionActive(true);
        userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole())
                .build();

        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}