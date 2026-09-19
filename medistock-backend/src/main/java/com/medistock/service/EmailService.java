package com.medistock.service;

public interface EmailService {
    void sendPasswordResetOtp(String toEmail, String otp, String userName);
}
