package com.lifesup.ticketflow.engine.validation;

import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import java.util.regex.Pattern;

/**
 * Quy tắc đặt tên cho các giá trị được chèn vào BPMN / biểu thức của Flowable.
 * Chỉ cho phép ký tự an toàn để không thể chèn mã vào biểu thức (EL injection) hay làm hỏng XML.
 */
public final class Identifiers {
    /** Key node, id nhánh gateway, tên field của form / API / quy trình con. */
    private static final Pattern SAFE_KEY = Pattern.compile("^[A-Za-z0-9_.-]+$");
    /** Process key (id process BPMN, phải là XML NCName nên không bắt đầu bằng số). */
    private static final Pattern PROCESS_KEY = Pattern.compile("^[A-Za-z_][A-Za-z0-9_.-]*$");
    /** Tên biến quy trình. */
    private static final Pattern VARIABLE_NAME = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*$");

    private Identifiers() {
    }

    public static boolean isSafeKey(String value) {
        return value != null && SAFE_KEY.matcher(value).matches();
    }

    public static boolean isProcessKey(String value) {
        return value != null && PROCESS_KEY.matcher(value).matches();
    }

    /** Tên biến hợp lệ và không dùng tiền tố dành riêng cho biến nội bộ của engine. */
    public static boolean isVariableName(String value) {
        return value != null && VARIABLE_NAME.matcher(value).matches()
                && !value.startsWith(WorkflowVariables.INTERNAL_PREFIX);
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
