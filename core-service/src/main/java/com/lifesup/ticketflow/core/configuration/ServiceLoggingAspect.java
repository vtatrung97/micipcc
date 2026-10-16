package com.lifesup.ticketflow.core.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Log bắt đầu (kèm tham số) và kết thúc (kèm kết quả, thời gian chạy) của mọi method public trong service.impl.
 * Tham số / kết quả chuyển sang JSON, che giá trị field nhạy cảm và cắt bớt nếu quá dài (flowJson tới 5 MB).
 */
@Aspect
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceLoggingAspect {

    static int MAX_LOG_LENGTH = 2000;
    // ponytail: che theo tên field trên chuỗi JSON, đủ cho DTO hiện tại; cần chặt hơn thì duyệt JsonNode
    static Pattern SENSITIVE_FIELD = Pattern.compile(
            "(\"[^\"]*(?i:password|secret|token|api[_-]?key)[^\"]*\"\\s*:\\s*)(\"(?:[^\"\\\\]|\\\\.)*\"|[^,}\\]]+)");

    ObjectMapper objectMapper;

    @Around("execution(public * com.lifesup.ticketflow.core.service.impl..*.*(..))")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Logger log = LoggerFactory.getLogger(signature.getDeclaringType());
        String method = signature.getName();

        String[] names = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        Map<String, Object> params = new LinkedHashMap<>();
        for (int i = 0; i < args.length; i++) {
            params.put(names != null ? names[i] : "arg" + i, args[i]);
        }
        log.info("Start {} params={}", method, toJson(params));

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            log.info("End {} in {} ms result={}", method, System.currentTimeMillis() - start, toJson(result));
            return result;
        } catch (Throwable ex) {
            log.warn("Failed {} in {} ms: {}", method, System.currentTimeMillis() - start, ex.toString());
            throw ex;
        }
    }

    private String toJson(Object value) {
        String json;
        try {
            json = objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            try {
                json = String.valueOf(value);
            } catch (Exception toStringError) {
                json = value.getClass().getName();
            }
        }
        json = SENSITIVE_FIELD.matcher(json).replaceAll("$1\"***\"");
        return json.length() > MAX_LOG_LENGTH
                ? json.substring(0, MAX_LOG_LENGTH) + "...(" + json.length() + " chars)"
                : json;
    }
}
