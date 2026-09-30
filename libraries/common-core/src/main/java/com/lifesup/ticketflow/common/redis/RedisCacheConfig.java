package com.lifesup.ticketflow.common.redis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/** Shared Redis-backed Spring Cache configuration. */
@Configuration(proxyBeanMethods = false)
@EnableCaching
@ConditionalOnProperty(prefix = "app.redis", name = "cache-enabled", havingValue = "true")
public class RedisCacheConfig {

    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public RedisCacheManager redisCacheManager(
            RedisConnectionFactory connectionFactory,
            RedisProperties properties) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(properties.cacheDefaultTtl())
                .disableCachingNullValues()
                .computePrefixWith(cacheName -> properties.keyPrefix() + "cache:" + cacheName + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults)
                .transactionAware()
                .build();
    }
}
