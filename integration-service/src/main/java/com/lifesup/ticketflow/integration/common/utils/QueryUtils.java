package com.lifesup.ticketflow.integration.common.utils;

import org.springframework.util.StringUtils;

/** Tiện ích dựng tham số truy vấn. */
public final class QueryUtils {

    private QueryUtils() {}

    /**
     * Từ khoá tìm kiếm thành mẫu LIKE "%...%", escape ký tự đặc biệt % _ \ để người dùng tìm đúng chữ.
     * Câu JPQL dùng kèm {@code like :keyword escape '\\'}.
     *
     * @return null nếu từ khoá rỗng (không lọc)
     */
    public static String toLikePattern(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String escaped = keyword.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
