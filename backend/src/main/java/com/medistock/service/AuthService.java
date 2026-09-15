package com.medistock.service;

import com.medistock.dto.AuthResponse;
import com.medistock.dto.ForgotPasswordRequest;
import com.medistock.dto.LoginRequest;
import com.medistock.dto.RegisterRequest;
import com.medistock.dto.ResetPasswordRequest;
import com.medistock.model.PasswordResetToken;
import com.medistock.model.Role;
import com.medistock.model.User;
import com.medistock.repository.PasswordResetTokenRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.CurrentUserProvider;
import com.medistock.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final ActiveUserTrackingService activeUserTrackingService;
    private final UserActivityService userActivityService;
    private final CurrentUserProvider currentUserProvider;
    private final EmailNotificationService emailNotificationService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    private static final int RESET_TOKEN_VALID_MINUTES = 30;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Self-registration NEVER creates an Admin or Supplier account.
     * MediStock supports exactly one Admin account, and Supplier accounts
     * must only be created through the Admin-controlled
     * POST /admin/suppliers/{supplierId}/create-login workflow (see
     * AdminController). The login page has no role picker for Admin/Supplier
     * either — but this is enforced here server-side regardless of what the
     * client sends, since the public /api/auth/register endpoint must never
     * trust a client-supplied role for privileged accounts.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        Role role = request.getRole() == null ? Role.STAFF : request.getRole();
        if (role != Role.STAFF && role != Role.PHARMACIST) {
            throw new IllegalArgumentException(
                    "Public registration only permits STAFF or PHARMACIST accounts. Admin accounts cannot be "
                            + "self-registered, and Supplier accounts must be created by an Admin.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .supplierId(null)
                .build();

        userRepository.save(user);
        return issueToken(user);
    }

    /**
     * The ONLY path that may create a SUPPLIER account. Called exclusively
     * from AdminController's create-login endpoint, which is itself
     * {@code @PreAuthorize("hasRole('ADMIN')")} — never reachable from the
     * public /api/auth/register endpoint. supplierId must reference an
     * existing Supplier record; the account is linked to it, not created
     * from arbitrary client input.
     */
    public AuthResponse registerSupplierAccount(RegisterRequest request, Long supplierId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        if (supplierId == null || !supplierRepository.existsById(supplierId)) {
            throw new EntityNotFoundException("Supplier not found with id: " + supplierId);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.SUPPLIER)
                .active(true)
                .supplierId(supplierId)
                .build();

        userRepository.save(user);
        return issueToken(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        activeUserTrackingService.recordLogin(user);
        userActivityService.log(user, "LOGIN", user.getFullName() + " logged in");

        return issueToken(user);
    }

    public void logout() {
        User user = currentUserProvider.getCurrentUser();
        if (user == null) return;
        activeUserTrackingService.recordLogout(user);
        userActivityService.log(user, "LOGOUT", user.getFullName() + " logged out");
    }

    /**
     * Always returns silently — the caller (AuthController) responds with
     * the same generic message whether or not the email exists, so this
     * endpoint can never be used to enumerate registered accounts
     * (requirement 21: "Never expose whether a specific email exists").
     */
    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return; // silently no-op — see method doc
        }
        User user = userOpt.get();

        byte[] rawBytes = new byte[32];
        secureRandom.nextBytes(rawBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(rawBytes);
        String tokenHash = sha256(rawToken);

        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES))
                .used(false)
                .build();
        passwordResetTokenRepository.save(token);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        emailNotificationService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = sha256(request.getToken());
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));

        if (token.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        userActivityService.log(user, "PASSWORD_RESET", user.getFullName() + " reset their password");
    }

    private String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash reset token", e);
        }
    }

    private AuthResponse issueToken(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .supplierId(user.getSupplierId())
                .build();
    }
}
