package com.medistock.authentication.service;

import com.medistock.authentication.dto.request.ForgotPasswordRequest;
import com.medistock.authentication.dto.request.ResetPasswordRequest;

import java.util.Map;

public interface PasswordResetService {

    Map<String, String> forgotPassword(ForgotPasswordRequest request);

    Map<String, String> resetPassword(ResetPasswordRequest request);

    boolean validateResetToken(String token);
}
