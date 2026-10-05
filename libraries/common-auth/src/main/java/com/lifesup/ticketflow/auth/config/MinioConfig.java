package com.lifesup.ticketflow.auth.config;

import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** MinIO client (shared with IPCC 2.0), used to load the Keycloak adapter config. Imported by CommonAuthAutoConfiguration. */
@Slf4j
@Configuration
public class MinioConfig {

    @Value("${minio.baseUrl}")
    private String baseUrl;

    @Value("${minio.accessKey}")
    private String minioAccessKey;

    @Value("${minio.secretKey}")
    private String minioSecretKey;

    @Bean
    public MinioClient minioClient() {
        log.info("MinIO endpoint: {}", baseUrl);
        return MinioClient.builder().endpoint(baseUrl).credentials(minioAccessKey, minioSecretKey).build();
    }
}
