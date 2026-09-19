package com.medistock.service.impl;

import com.medistock.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp, String userName) {
        String greeting = (userName != null && !userName.isBlank()) ? "Hello " + userName + "," : "Hello,";
        String htmlContent = buildOtpHtmlEmail(greeting, otp);

        boolean emailSent = false;

        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "MediStock Security");
                helper.setTo(toEmail);
                helper.setSubject("MediStock — Your Password Reset OTP Code: " + otp);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                emailSent = true;
                log.info("Password reset OTP email successfully sent to: {}", toEmail);
            } catch (Exception e) {
                log.warn("Failed to dispatch real SMTP email to {}: {}. Falling back to console dispatch.", toEmail, e.getMessage());
            }
        } else {
            log.info("SMTP credentials not fully configured (spring.mail.username is empty). Email will be logged to console for testing.");
        }

        // Always log OTP visibly for developer/admin convenience & seamless testing
        log.info("\n" +
                "=========================================================\n" +
                "  MEDISTOCK PASSWORD RESET OTP NOTIFICATION\n" +
                "  To: " + toEmail + "\n" +
                "  OTP CODE: [ " + otp + " ]\n" +
                "  Validity: 5 Minutes\n" +
                "  Status: " + (emailSent ? "DISPATCHED VIA SMTP" : "LOGGED FOR VERIFICATION") + "\n" +
                "=========================================================");
    }

    private String buildOtpHtmlEmail(String greeting, String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }" +
                ".container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }" +
                ".header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff; }" +
                ".header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }" +
                ".header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }" +
                ".content { padding: 32px 28px; }" +
                ".greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }" +
                ".desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }" +
                ".otp-card { background: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }" +
                ".otp-label { font-size: 12px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }" +
                ".otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; user-select: all; }" +
                ".expiry { font-size: 12px; color: #dc2626; margin-top: 8px; font-weight: 600; }" +
                ".warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 12.5px; color: #92400e; line-height: 1.5; margin-top: 24px; }" +
                ".footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='header'>" +
                "    <h1>MediStock Security</h1>" +
                "    <p>Medical Inventory Management System</p>" +
                "  </div>" +
                "  <div class='content'>" +
                "    <div class='greeting'>" + greeting + "</div>" +
                "    <div class='desc'>We received a request to reset your password for your MediStock account. Use the one-time verification code (OTP) below to complete your password reset.</div>" +
                "    <div class='otp-card'>" +
                "      <div class='otp-label'>Verification Code (OTP)</div>" +
                "      <div class='otp-code'>" + otp + "</div>" +
                "      <div class='expiry'>Expires in 5 minutes</div>" +
                "    </div>" +
                "    <div class='warning'>" +
                "      <strong>Security Warning:</strong> Never share this OTP with anyone. MediStock personnel will never ask for your verification code. If you did not make this request, please change your password or contact your administrator." +
                "    </div>" +
                "  </div>" +
                "  <div class='footer'>" +
                "    &copy; 2026 MediStock. All rights reserved. &bull; Secure Healthcare Inventory Portal" +
                "  </div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
