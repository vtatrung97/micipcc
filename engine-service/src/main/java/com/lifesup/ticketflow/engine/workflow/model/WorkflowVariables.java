package com.lifesup.ticketflow.engine.workflow.model;

/**
 * Tên biến nội bộ của engine (tiền tố {@value #INTERNAL_PREFIX}), không trùng với biến người dùng khai báo.
 *
 * <pre>
 *  core / quy trình cha ──__input──► START (map vào biến theo START.variables)
 *  END (map biến theo END.results) ──__output──► core / quy trình cha
 * </pre>
 */
public final class WorkflowVariables {
    public static final String INTERNAL_PREFIX = "__";
    /** Dữ liệu đầu vào khi khởi tạo: form (MANUAL), payload API (AUTO), dữ liệu quy trình cha (SUB_PROCESS). */
    public static final String INPUT = "__input";
    /** Kết quả trả ra khi kết thúc, key là formField trong END.results. */
    public static final String OUTPUT = "__output";
    private static final String GATEWAY_RESULT_PREFIX = "__gateway_";

    private WorkflowVariables() {
    }

    /** Biến tạm (transient) giữ các nhánh khớp điều kiện của một gateway, chỉ sống trong transaction hiện tại. */
    public static String gatewayResult(String gatewayElementId) {
        return GATEWAY_RESULT_PREFIX + gatewayElementId;
    }
}
