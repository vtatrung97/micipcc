package com.lifesup.ticketflow.engine.workflow.model;

/**
 * Giá trị {@code sourceHandle} của edge, tức cổng ra của node nguồn.
 * Gateway dùng thêm id của từng nhánh (case id) làm handle.
 */
public final class SourceHandles {
    /** Cổng ra duy nhất của START, JOIN, USER_TASK, NOTIFICATION, SUB_PROCESS. */
    public static final String NEXT = "next";
    /** SYSTEM_TASK gọi API thành công. */
    public static final String SUCCESS = "success";
    /** SYSTEM_TASK lỗi nghiệp vụ, hoặc gateway đánh giá điều kiện lỗi. */
    public static final String ERROR = "error";
    /** Nhánh mặc định của gateway khi không nhánh nào khớp điều kiện. */
    public static final String DEFAULT = "default";

    private SourceHandles() {
    }
}
