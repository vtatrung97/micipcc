package com.lifesup.ticketflow.common.i18n;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Lấy message đa ngôn ngữ theo locale của request hiện tại.
 * Dùng static để các DTO như ApiResponse gọi được mà không cần inject.
 */
@Component
public class Translator {

    private static MessageSource messageSource;

    public Translator(MessageSource messageSource) {
        Translator.messageSource = messageSource;
    }

    public static String toLocale(String key, Object... args) {
        return toLocale(LocaleContextHolder.getLocale(), key, args);
    }

    public static String toLocale(Locale locale, String key, Object... args) {
        return messageSource.getMessage(key, args, key, locale);
    }
}
