package com.lifesup.ticketflow.engine.common.enums;

/** Toán tử so sánh trong điều kiện rẽ nhánh của gateway. */
public enum ConditionOperator {
    EQ,
    NEQ,
    GT,
    GTE,
    LT,
    LTE,
    /** Giá trị nằm trong danh sách, danh sách viết dạng "a, b, c". */
    IN,
    NOT_IN,
    /** Chuỗi chứa chuỗi con, hoặc danh sách chứa phần tử. */
    CONTAINS;

    /** Toán tử so sánh số: giá trị cấu hình và giá trị biến đều phải là số. */
    public boolean isNumeric() {
        return this == GT || this == GTE || this == LT || this == LTE;
    }

    /** EQ / NEQ cho phép giá trị rỗng (so với chuỗi rỗng), các toán tử còn lại bắt buộc có giá trị. */
    public boolean requiresValue() {
        return this != EQ && this != NEQ;
    }
}
