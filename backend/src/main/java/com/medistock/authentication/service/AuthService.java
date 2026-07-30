package com.medistock.authentication.service;

import com.medistock.authentication.dto.request.LoginRequest;
import com.medistock.authentication.dto.request.RegisterRequest;
import com.medistock.authentication.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
