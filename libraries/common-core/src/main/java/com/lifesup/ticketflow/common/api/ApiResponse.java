package com.lifesup.ticketflow.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.common.i18n.Translator;
import com.lifesup.ticketflow.common.web.RequestIdFilter;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;

import java.util.Locale;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    int code;
    String message;
    T result;
    String requestId;

    public static <T> ApiResponse<T> success() {
        return success(null);
    }

    public static <T> ApiResponse<T> success(T result) {
        return ApiResponse.<T>builder()
                .code(HttpStatus.OK.value())
                .message(Translator.toLocale("response.success"))
                .result(result)
                .requestId(MDC.get(RequestIdFilter.MDC_KEY))
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return error(errorCode, Translator.toLocale(errorCode.getMessage()), null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, Locale locale) {
        return error(errorCode, Translator.toLocale(locale, errorCode.getMessage()), null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message, T result) {
        return ApiResponse.<T>builder()
                .code(errorCode.getCode())
                .message(message)
                .result(result)
                .requestId(MDC.get(RequestIdFilter.MDC_KEY))
                .build();
    }
}
