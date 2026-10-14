package com.lifesup.ticketflow.core.common.util;

import org.springframework.util.StringUtils;

public final class QueryUtils {

    private QueryUtils() {
    }

    /**
     * Từ khoá tìm kiếm thành mẫu LIKE tìm tương đối, escape ký tự đặc biệt % _ \ để người dùng tìm đúng chữ.
     * Dùng kèm {@code like :param escape '\\'} trong JPQL.
     *
     * @return null nếu không có từ khoá (= không lọc)
     */
    public static String toLikePattern(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String escaped = keyword.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
