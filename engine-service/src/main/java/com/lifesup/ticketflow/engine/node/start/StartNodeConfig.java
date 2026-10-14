package com.lifesup.ticketflow.engine.node.start;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.workflow.model.NodeConfig;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** START: các biến của quy trình, khởi tạo từ dữ liệu đầu vào. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartNodeConfig implements NodeConfig {
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Variable> variables = new ArrayList<>();

    /**
     * Một biến. Giá trị lấy theo thứ tự: {@code value} cố định → {@code formField} của dữ liệu form
     * → {@code apiField} của payload API; không có thì null.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Variable {
        String name;
        String formField;
        String apiField;
        String value;
        /** Tên hiển thị, chỉ phục vụ FE. */
        String displayName;
    }
}
