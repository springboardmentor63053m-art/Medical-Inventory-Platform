package com.medistock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Tech-stack doc lists JavaMailSender as a notification channel. Real SMTP
 * delivery needs real credentials, so this stays inactive (a clean no-op)
 * until spring.mail.host is set AND app.notifications.email.enabled=true —
 * at that point AlertScheduler's daily critical-alert digest actually sends.
 */
@Service
@Slf4j
public class EmailNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;

    @Value("${app.notifications.email.enabled:false}")
    private boolean enabled;

    @Value("${app.notifications.email.recipients:}")
    private String recipients;

    @Value("${spring.mail.username:medistock@example.com}")
    private String fromAddress;

    public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider, Environment environment) {
        this.mailSenderProvider = mailSenderProvider;
        this.environment = environment;
    }

    public boolean isActive() {
        return enabled && mailSenderProvider.getIfAvailable() != null && !recipients.isBlank();
    }

    public void sendAlertDigest(String subject, String body) {
        if (!isActive()) {
            log.debug("Email alerts not configured/enabled — skipping '{}'", subject);
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        try {
            List<String> to = Arrays.stream(recipients.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).toList();
            if (to.isEmpty()) return;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to.toArray(new String[0]));
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Never let a notification failure break inventory processing.
            log.warn("Failed to send email alert digest: {}", e.getMessage());
        }
    }

    /**
     * Sends a password-reset link to a single recipient (requirement 21).
     * If email isn't configured/enabled, the link is logged instead of
     * silently dropped, so local/demo environments can still complete the
     * reset flow without real SMTP credentials — the raw token is never
     * returned from the API itself (see AuthService.forgotPassword).
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (!enabled || mailSenderProvider.getIfAvailable() == null) {
            if (environment.acceptsProfiles(Profiles.of("prod"))) {
                // Never put a live, usable reset token in production logs — a
                // reader of the logs (or a log-aggregation breach) could use it
                // to take over the account. Fail visibly instead of leaking it.
                log.warn("Password reset requested for {} but email isn't configured/enabled in production — "
                        + "the user cannot receive their reset link. Set EMAIL_ALERTS_ENABLED, MAIL_USERNAME and "
                        + "MAIL_PASSWORD (see application.properties) to enable delivery.", toEmail);
                return;
            }
            log.info("Email alerts disabled or JavaMailSender not configured — password reset link for {}: {}",
                    toEmail, resetLink);
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Reset your MediStock password");
            message.setText("We received a request to reset your MediStock password.\n\n"
                    + "Reset link (valid for 30 minutes): " + resetLink + "\n\n"
                    + "If you didn't request this, you can safely ignore this email.");
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
