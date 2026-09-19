package com.medistock.service;

import com.medistock.dto.ForgotPasswordRequest;
import com.medistock.dto.ResetPasswordRequest;
import com.medistock.dto.VerifyOtpRequest;

public interface PasswordResetService {
    void sendResetOtp(ForgotPasswordRequest request);
    boolean verifyOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
}
