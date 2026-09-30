package com.lifesup.ticketflow.auth.filter;

import com.lifesup.ticketflow.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/** Writes a standardized authentication error before a request reaches Spring MVC. */
@FunctionalInterface
public interface AuthenticationErrorWriter {
    void write(HttpServletRequest request, HttpServletResponse response, ErrorCode errorCode) throws IOException;
}
