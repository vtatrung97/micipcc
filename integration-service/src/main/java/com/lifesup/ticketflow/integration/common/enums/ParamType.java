package com.lifesup.ticketflow.integration.common.enums;

/** Kiểu dữ liệu của tham số đầu vào / giá trị đầu ra của API. */
public enum ParamType {
    /** Chuỗi. */
    STRING,
    /** Số (nguyên hoặc thập phân). */
    NUMBER,
    /** true / false. */
    BOOLEAN,
    /** Chuỗi ngày giờ ISO-8601, VD 2026-10-13 hoặc 2026-10-13T10:00:00+07:00. */
    DATE,
    /** JSON object. */
    OBJECT,
    /** JSON array. */
    ARRAY
}
