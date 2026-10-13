package com.lifesup.ticketflow.integration.common.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.Map;

/**
 * Chuyển đổi giữa dữ liệu JSON trong request / response (DTO *Data, Map, List, JsonNode) và chuỗi lưu ở cột LONGTEXT.
 * Giá trị rỗng (null, object / mảng / map rỗng, DTO không có field nào) lưu NULL.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JsonHelper {

    static final String EMPTY_OBJECT = "{}";

    ObjectMapper objectMapper;

    /** JsonNode không có giá trị: field không gửi, gửi null, hoặc object / mảng rỗng. */
    public static boolean isEmpty(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || (node.isContainerNode() && node.isEmpty());
    }

    /** @return null nếu giá trị rỗng */
    public String write(Object value) {
        if (value == null
                || (value instanceof JsonNode node && isEmpty(node))
                || (value instanceof Collection<?> collection && collection.isEmpty())
                || (value instanceof Map<?, ?> map && map.isEmpty())) {
            return null;
        }
        String json = writeValue(value);
        // DTO *Data bỏ qua field null nên DTO không có field nào ra "{}"
        return EMPTY_OBJECT.equals(json) ? null : json;
    }

    /** Luôn chuyển sang JSON, kể cả giá trị rỗng. */
    public String writeValue(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Không chuyển được dữ liệu sang JSON", e);
        }
    }

    /** @return null nếu chuỗi rỗng */
    public JsonNode read(String json) {
        return StringUtils.hasText(json) ? parse(() -> objectMapper.readTree(json)) : null;
    }

    /** @return null nếu chuỗi rỗng */
    public <T> T read(String json, Class<T> type) {
        return StringUtils.hasText(json) ? parse(() -> objectMapper.readValue(json, type)) : null;
    }

    /** @return null nếu chuỗi rỗng */
    public <T> T read(String json, TypeReference<T> type) {
        return StringUtils.hasText(json) ? parse(() -> objectMapper.readValue(json, type)) : null;
    }

    /** Dữ liệu đã kiểm tra lúc lưu nên lỗi parse là lỗi hệ thống. */
    private static <T> T parse(JsonReader<T> reader) {
        try {
            return reader.read();
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Dữ liệu JSON trong DB không hợp lệ", e);
        }
    }

    @FunctionalInterface
    private interface JsonReader<T> {
        T read() throws JsonProcessingException;
    }
}
