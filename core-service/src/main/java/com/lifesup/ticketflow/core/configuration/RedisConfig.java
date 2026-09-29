package com.lifesup.ticketflow.core.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConfiguration;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisSentinelConfiguration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.util.StringUtils;

import java.util.HashSet;

@Slf4j
@Configuration
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(AppProperties appProperties) {
        AppProperties.Redis redis = appProperties.redis();

        LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfig =
                LettuceClientConfiguration.builder().commandTimeout(redis.timeout());
        if (redis.ssl()) {
            clientConfig.useSsl();
        }

        RedisConfiguration configuration;
        if (redis.sentinel()) {
            log.info("Redis Sentinel: master={}, nodes={}", redis.master(), redis.nodes());
            RedisSentinelConfiguration sentinelConfig =
                    new RedisSentinelConfiguration(redis.master(), new HashSet<>(redis.nodes()));
            sentinelConfig.setDatabase(redis.database());
            if (StringUtils.hasText(redis.username())) {
                sentinelConfig.setUsername(redis.username());
            }
            if (StringUtils.hasText(redis.password())) {
                sentinelConfig.setPassword(RedisPassword.of(redis.password()));
                sentinelConfig.setSentinelPassword(RedisPassword.of(redis.password()));
            }
            configuration = sentinelConfig;
        } else {
            log.info("Redis standalone: {}:{}", redis.host(), redis.port());
            RedisStandaloneConfiguration standaloneConfig = new RedisStandaloneConfiguration(redis.host(), redis.port());
            standaloneConfig.setDatabase(redis.database());
            if (StringUtils.hasText(redis.username())) {
                standaloneConfig.setUsername(redis.username());
            }
            if (StringUtils.hasText(redis.password())) {
                standaloneConfig.setPassword(RedisPassword.of(redis.password()));
            }
            configuration = standaloneConfig;
        }
        return new LettuceConnectionFactory(configuration, clientConfig.build());
    }
}
