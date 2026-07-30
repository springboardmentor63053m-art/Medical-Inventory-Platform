package com.medistock.authentication.service.impl;

import com.medistock.authentication.dto.request.ForgotPasswordRequest;
import com.medistock.authentication.dto.request.ResetPasswordRequest;
import com.medistock.authentication.entity.PasswordResetToken;
import com.medistock.authentication.repository.PasswordResetTokenRepository;
import com.medistock.authentication.service.PasswordResetService;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user registered with email: " + request.getEmail()));

        // Delete previous unused reset tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate 6-digit reset code
        String resetCode = String.format("%06d", new SecureRandom().nextInt(1000000));

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(resetCode)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Attempt to send email if MailSender bean is configured
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("MediStock Password Reset Code");
                message.setText("Hello " + user.getFirstName() + ",\n\n" +
                        "Your password reset verification code is: " + resetCode + "\n\n" +
                        "This code will expire in 15 minutes.\n\n" +
                        "If you did not request a password reset, please ignore this email.");
                mailSender.send(message);
                log.info("Password reset email sent to {}", user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        } else {
            log.info("JavaMailSender not configured. Password reset code for {}: {}", user.getEmail(), resetCode);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset verification code sent to " + user.getEmail());
        response.put("resetCode", resetCode); // Included for local dev ease & testing
        return response;
    }

    @Override
    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new code.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully. You can now log in with your new password.");
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        return tokenRepository.findByTokenAndUsedFalse(token)
                .map(t -> !t.getExpiryDate().isBefore(LocalDateTime.now()))
                .orElse(false);
    }
}
