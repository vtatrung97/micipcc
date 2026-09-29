package com.lifesup.processx.core.controller;

import com.lifesup.processx.core.dto.request.LoginRequest;
import com.lifesup.processx.core.dto.request.RefreshTokenRequest;
import com.lifesup.processx.core.dto.response.ApiResponse;
import com.lifesup.processx.core.dto.response.CurrentUserResponse;
import com.lifesup.processx.core.dto.response.TokenResponse;
import com.lifesup.processx.core.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @Operation(summary = "Đăng nhập bằng username/password qua Keycloak")
    @SecurityRequirements
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authenticationService.login(request));
    }

    @Operation(summary = "Lấy access token mới bằng refresh token")
    @SecurityRequirements
    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authenticationService.refreshToken(request.getRefreshToken()));
    }

    @Operation(summary = "Đăng xuất: kết thúc session Keycloak (access token của session cũng hết hiệu lực)")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authenticationService.logout(request.getRefreshToken());
        return ApiResponse.success();
    }

    @Operation(summary = "Thông tin người dùng/service đang gọi API")
    @GetMapping("/me")
    public ApiResponse<CurrentUserResponse> me() {
        return ApiResponse.success(authenticationService.currentUser());
    }
}
