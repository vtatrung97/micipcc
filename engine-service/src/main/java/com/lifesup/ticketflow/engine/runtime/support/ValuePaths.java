package com.lifesup.ticketflow.engine.runtime.support;

import java.util.Map;

/** Lấy giá trị trong map lồng nhau theo đường dẫn "a.b.c". */
public final class ValuePaths {

    private ValuePaths() {
    }

    /** Key có sẵn dấu chấm được ưu tiên khớp nguyên văn; không tìm thấy trả null. */
    public static Object get(Map<String, ?> source, String path) {
        if (source == null || path == null) {
            return null;
        }
        if (source.containsKey(path)) {
            return source.get(path);
        }
        Object current = source;
        for (String part : path.split("\\.")) {
            if (!(current instanceof Map<?, ?> map)) {
                return null;
            }
            current = map.get(part);
        }
        return current;
    }
}
