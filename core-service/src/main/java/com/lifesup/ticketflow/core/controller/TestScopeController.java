package com.lifesup.ticketflow.core.controller;

import com.lifesup.ticketflow.auth.aop.CheckScopePermission;
import com.lifesup.ticketflow.common.api.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test-scope")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestScopeController {

    @GetMapping
    @CheckScopePermission(scope = "CREATE")
    public ApiResponse<?> test() {
        return ApiResponse.success();
    }
}
