package com.lifesup.processx.core.service;

import com.lifesup.processx.core.dto.request.LoginRequest;
import com.lifesup.processx.core.dto.response.CurrentUserResponse;
import com.lifesup.processx.core.dto.response.TokenResponse;

public interface AuthenticationService {

    TokenResponse login(LoginRequest request);

    TokenResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    CurrentUserResponse currentUser();
}
