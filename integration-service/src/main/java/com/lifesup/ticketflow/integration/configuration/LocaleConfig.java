package com.lifesup.ticketflow.integration.configuration;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;

@Configuration
public class LocaleConfig {

    /** Tên bean bắt buộc là "localeResolver" để DispatcherServlet sử dụng. */
    @Bean
    public LocaleResolver localeResolver(AppProperties appProperties) {
        return new HeaderLocaleResolver(
                appProperties.i18n().defaultLocale(), appProperties.i18n().supportedLocales());
    }

    /** Cho phép message của Bean Validation dùng key trong i18n/messages*.properties, VD: {validation.username.required}. */
    @Bean
    public LocalValidatorFactoryBean validator(MessageSource messageSource) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.setValidationMessageSource(messageSource);
        return validator;
    }
}
