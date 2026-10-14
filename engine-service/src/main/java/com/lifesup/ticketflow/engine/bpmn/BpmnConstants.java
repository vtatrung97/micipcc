package com.lifesup.ticketflow.engine.bpmn;

/** Hằng số của BPMN do engine sinh ra: namespace mở rộng, tên phần mở rộng và mã lỗi BPMN. */
public final class BpmnConstants {
    /** Namespace cho phần mở rộng tf:* trong BPMN XML. */
    public static final String NAMESPACE = "https://lifesup.com/ticket-flow";
    public static final String NAMESPACE_PREFIX = "tf";

    /** tf:config: cấu hình node (JSON) đã chuẩn hoá, runtime đọc lại theo id phần tử. */
    public static final String EXTENSION_CONFIG = "config";
    /** tf:gatewayRef: id gateway mà task "đánh giá điều kiện" phục vụ. */
    public static final String EXTENSION_GATEWAY_REF = "gatewayRef";

    /** Lỗi nghiệp vụ khi gọi API của SYSTEM_TASK, bắt bằng boundary error → nhánh error. */
    public static final String ERROR_SYSTEM_TASK = "SYSTEM_TASK_ERROR";
    /** Lỗi khi đánh giá điều kiện gateway (thiếu dữ liệu, sai kiểu), bắt bằng boundary error → nhánh error. */
    public static final String ERROR_GATEWAY = "GATEWAY_ERROR";

    private BpmnConstants() {
    }
}
