package com.lifesup.ticketflow.common.json;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Bỏ khoảng trắng đầu/cuối của chuỗi khi đọc request, gắn từng field bằng
 * {@code @JsonDeserialize(using = StringTrimDeserializer.class)} (mã, tên...) để "ABC " và "ABC" không thành 2 giá trị.
 * Không đăng ký toàn cục để các chuỗi phải giữ nguyên văn (JSON canvas, JSONata, JSON Schema) không bị đổi.
 */
public class StringTrimDeserializer extends JsonDeserializer<String> {
    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        return value == null ? null : value.trim();
    }
}
