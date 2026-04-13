package com.vibechecker.api.service;

import com.vibechecker.api.dto.request.LoginRequest;
import com.vibechecker.api.dto.request.RegisterRequest;
import com.vibechecker.api.dto.response.AuthResponse;
import com.vibechecker.api.dto.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String username);
}