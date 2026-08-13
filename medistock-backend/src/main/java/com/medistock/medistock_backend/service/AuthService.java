package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.JwtResponse;
import com.medistock.medistock_backend.dto.LoginRequest;
import com.medistock.medistock_backend.dto.RegisterRequest;
import com.medistock.medistock_backend.dto.UserDto;
import com.medistock.medistock_backend.dto.ChangePasswordRequest;

public interface AuthService {
    JwtResponse login(LoginRequest loginRequest);
    UserDto register(RegisterRequest registerRequest);
    void changePassword(String username, ChangePasswordRequest request);
}
