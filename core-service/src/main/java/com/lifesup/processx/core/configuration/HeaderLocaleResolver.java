package com.lifesup.processx.core.configuration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.LocaleResolver;

import java.util.List;
import java.util.Locale;

/**
 * Xác định ngôn ngữ theo header Accept-Language.
 * Không truyền header, header sai định dạng hoặc ngôn ngữ không hỗ trợ đều trả về ngôn ngữ mặc định (vi).
 */
public class HeaderLocaleResolver implements LocaleResolver {

    private final Locale defaultLocale;
    private final List<Locale> supportedLocales;

    public HeaderLocaleResolver(Locale defaultLocale, List<Locale> supportedLocales) {
        this.defaultLocale = defaultLocale;
        this.supportedLocales = List.copyOf(supportedLocales);
    }

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.ACCEPT_LANGUAGE);
        if (!StringUtils.hasText(header)) {
            return defaultLocale;
        }
        try {
            Locale matched = Locale.lookup(Locale.LanguageRange.parse(header), supportedLocales);
            return matched != null ? matched : defaultLocale;
        } catch (IllegalArgumentException e) {
            return defaultLocale;
        }
    }

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
        throw new UnsupportedOperationException("Ngôn ngữ chỉ được xác định qua header Accept-Language");
    }
}
