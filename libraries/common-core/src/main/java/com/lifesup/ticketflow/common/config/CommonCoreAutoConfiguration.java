package com.lifesup.ticketflow.common.config;

import com.lifesup.ticketflow.common.exception.GlobalExceptionHandler;
import com.lifesup.ticketflow.common.i18n.Translator;
import com.lifesup.ticketflow.common.redis.RedisCacheConfig;
import com.lifesup.ticketflow.common.redis.RedisConfig;
import com.lifesup.ticketflow.common.web.RequestIdFilter;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Import;

/** Registers shared components whenever common-core is on the classpath. */
@AutoConfiguration
@Import({
    Translator.class,
    RequestIdFilter.class,
    GlobalExceptionHandler.class,
    RedisConfig.class,
    RedisCacheConfig.class
})
public class CommonCoreAutoConfiguration {
}
