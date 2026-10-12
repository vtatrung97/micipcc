package com.lifesup.ticketflow.common.config;

import com.lifesup.ticketflow.common.exception.BaseExceptionHandler;
import com.lifesup.ticketflow.common.exception.DefaultExceptionHandler;
import com.lifesup.ticketflow.common.i18n.Translator;
import com.lifesup.ticketflow.common.redis.RedisCacheConfig;
import com.lifesup.ticketflow.common.redis.RedisConfig;
import com.lifesup.ticketflow.common.web.RequestIdFilter;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

/** Registers shared components whenever common-core is on the classpath. */
@AutoConfiguration
@Import({
    Translator.class,
    RequestIdFilter.class,
    RedisConfig.class,
    RedisCacheConfig.class
})
public class CommonCoreAutoConfiguration {

    /** Service đã có handler riêng (kế thừa BaseExceptionHandler) thì không đăng ký handler mặc định. */
    @Bean
    @ConditionalOnMissingBean(BaseExceptionHandler.class)
    public DefaultExceptionHandler defaultExceptionHandler() {
        return new DefaultExceptionHandler();
    }
}
