package com.medistock.service.impl;

import com.medistock.dto.ForgotPasswordRequest;
import com.medistock.dto.ResetPasswordRequest;
import com.medistock.dto.VerifyOtpRequest;
import com.medistock.entity.PasswordResetToken;
import com.medistock.entity.User;
import com.medistock.exception.BadRequestException;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.PasswordResetTokenRepository;
import com.medistock.repository.UserRepository;
import com.medistock.service.EmailService;
import com.medistock.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_REQUESTS_PER_HOUR = 6;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetServiceImpl(UserRepository userRepository,
                                   PasswordResetTokenRepository tokenRepository,
                                   EmailService emailService,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void sendResetOtp(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No MediStock account found associated with email: " + email));

        // Rate limiting check: max 6 OTP requests in the past 1 hour
        List<PasswordResetToken> recentTokens = tokenRepository.findByEmailAndCreatedAtAfter(
                email, LocalDateTime.now().minusHours(1)
        );
        if (recentTokens.size() >= MAX_REQUESTS_PER_HOUR) {
            throw new BadRequestException("Too many OTP requests. Please wait a few minutes before trying again.");
        }

        // Generate 6-digit random OTP
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

        // Create token entity
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Dispatch Email
        String userName = (user.getFirstName() != null ? user.getFirstName() : user.getFullName());
        emailService.sendPasswordResetOtp(email, otp, userName);
    }

    @Override
    @Transactional
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();

        PasswordResetToken token = tokenRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("No active OTP request found for this email. Please request a new code."));

        if (token.isExpired()) {
            throw new BadRequestException("The OTP code has expired. Please request a new one.");
        }

        if (!token.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code. Please check your email and try again.");
        }

        token.setVerified(true);
        tokenRepository.save(token);
        log.info("OTP successfully verified for user email: {}", email);
        return true;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found."));

        PasswordResetToken token = tokenRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("No active OTP request found. Please request a new code."));

        if (token.isExpired()) {
            throw new BadRequestException("The OTP code has expired. Please request a new code.");
        }

        if (!token.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code.");
        }

        // Update user password
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        log.info("Password successfully reset for user: {}", email);
    }

    // Helper to get password from request safely
    private static class RequestHelper {
        static String getPwd(ResetPasswordRequest req) {
            return req.getNewPassword();
        }
    }
}
