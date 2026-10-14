package com.lifesup.ticketflow.engine.bpmn;

/**
 * Tên bean runtime và các biểu thức (EL) được ghi vào BPMN. Mọi biểu thức đều sinh tại đây; giá trị chèn vào
 * (id phần tử, id nhánh, tên field) đã được validator giới hạn ký tự an toàn nên không thể chèn mã.
 *
 * <p>Đổi tên bean là thay đổi không tương thích với các BPMN đã deploy.
 */
public final class BpmnExpressions {
    public static final String BEAN_START_VARIABLE_LISTENER = "startVariableListener";
    public static final String BEAN_END_RESULT_LISTENER = "endResultListener";
    public static final String BEAN_USER_TASK_ASSIGNMENT = "userTaskAssignment";
    public static final String BEAN_GATEWAY_EVALUATION_DELEGATE = "gatewayEvaluationDelegate";
    public static final String BEAN_SYSTEM_TASK_DELEGATE = "systemTaskDelegate";
    public static final String BEAN_NOTIFICATION_DELEGATE = "notificationDelegate";
    public static final String BEAN_CONDITION_EVALUATOR = "conditionEvaluator";
    public static final String BEAN_SUB_PROCESS_IO = "subProcessIo";

    private BpmnExpressions() {
    }

    /** Biểu thức delegateExpression trỏ tới bean. */
    public static String bean(String beanName) {
        return "${" + beanName + "}";
    }

    /** Điều kiện của một nhánh gateway: nhánh {@code caseId} có khớp không. */
    public static String caseCondition(String gatewayElementId, String caseId) {
        return "${" + BEAN_CONDITION_EVALUATOR + ".matches(execution, '" + gatewayElementId + "', '" + caseId + "')}";
    }

    /** Người xử lý của user task, Flowable đánh giá khi tạo task (null = để candidate tự nhận). */
    public static String userTaskAssignee() {
        return "${" + BEAN_USER_TASK_ASSIGNMENT + ".assignee(execution)}";
    }

    /** Hạn xử lý của user task theo SLA của node (null = không có hạn). */
    public static String userTaskDueDate() {
        return "${" + BEAN_USER_TASK_ASSIGNMENT + ".dueDate(execution)}";
    }

    /** Dữ liệu đầu vào truyền cho quy trình con, dựng theo inputs của call activity. */
    public static String subProcessInput(String callActivityElementId) {
        return "${" + BEAN_SUB_PROCESS_IO + ".input(execution, '" + callActivityElementId + "')}";
    }

    /** Một giá trị trong kết quả của quy trình con, đánh giá trên execution của quy trình con. */
    public static String subProcessOutput(String subField) {
        return "${" + BEAN_SUB_PROCESS_IO + ".output(execution, '" + subField + "')}";
    }
}
