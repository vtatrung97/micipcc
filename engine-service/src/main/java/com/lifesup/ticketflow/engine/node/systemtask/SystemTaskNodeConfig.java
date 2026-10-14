package com.lifesup.ticketflow.engine.node.systemtask;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.workflow.NodeConfig;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** SYSTEM_TASK: gọi một API đã khai báo trong integration-service. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemTaskNodeConfig implements NodeConfig {
    /** Mã hệ thống ngoài (external_system.code). */
    String systemId;
    /** Mã API (operation.code). */
    String apiId;
    /** Timeout mỗi lần gọi (giây); null = dùng cấu hình của operation. */
    Integer timeout;
    /** Số lần thử lại khi lỗi; null = dùng cấu hình của operation. integration-service là nơi thực hiện retry. */
    Integer retry;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Input> inputs = new ArrayList<>();
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Output> outputs = new ArrayList<>();

    /** Tham số {@code apiParam} của API lấy giá trị từ biến {@code variable}. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Input {
        String apiParam;
        String variable;
    }

    /** Ghi field {@code apiField} trong kết quả API (cho phép đường dẫn "a.b") vào biến {@code variable}. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Output {
        String apiField;
        String variable;
        String displayName;
    }
}
