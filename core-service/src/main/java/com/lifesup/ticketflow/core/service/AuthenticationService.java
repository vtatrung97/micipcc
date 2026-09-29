package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.core.dto.request.LoginRequest;
import com.lifesup.ticketflow.core.dto.response.CurrentUserResponse;
import com.lifesup.ticketflow.core.dto.response.TokenResponse;

public interface AuthenticationService {

    TokenResponse login(LoginRequest request);

    TokenResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    CurrentUserResponse currentUser();
}
