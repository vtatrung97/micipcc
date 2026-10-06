package com.lifesup.ticketflow.auth.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * Bảng key nội bộ dùng chung mọi service, từ {@code app.api-key.keys} dạng {@code serviceName:key,serviceName:key}.
 *
 * <pre>
 *  gọi sang service X   → gửi header X-API-Key = get("X")
 *  nhận request         → chỉ chấp nhận get(spring.application.name)
 * </pre>
 */
@Slf4j
public class InternalApiKeys {

    static final int MIN_KEY_LENGTH = 32;

    private final Map<String, String> keys;

    public InternalApiKeys(String config) {
        this.keys = Map.copyOf(parse(config));
        log.info("Loaded internal API keys for service(s): {}", keys.keySet());
    }

    /** Key của service đích, null nếu chưa cấu hình. */
    public String get(String serviceName) {
        return keys.get(serviceName);
    }

    private static Map<String, String> parse(String config) {
        Map<String, String> result = new HashMap<>();
        if (!StringUtils.hasText(config)) {
            return result;
        }
        for (String item : config.split(",")) {
            String trimmed = item.trim();
            int separator = trimmed.indexOf(':');
            if (separator <= 0 || separator == trimmed.length() - 1) {
                if (!trimmed.isEmpty()) {
                    log.warn("Ignoring malformed API key entry (expected serviceName:key)");
                }
                continue;
            }
            String serviceName = trimmed.substring(0, separator).trim();
            String key = trimmed.substring(separator + 1).trim();
            if (key.length() < MIN_KEY_LENGTH) {
                log.warn("Ignoring API key for service {}: key must be at least {} characters long", serviceName, MIN_KEY_LENGTH);
                continue;
            }
            result.put(serviceName, key);
        }
        return result;
    }
}
