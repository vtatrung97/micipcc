package com.lifesup.ticketflow.engine.node.end;

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

/** END: kết quả trả ra của quy trình (core hiển thị / quy trình cha nhận qua SUB_PROCESS.outputs). */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EndNodeConfig implements NodeConfig {
    /** Form hiển thị kết quả, chỉ phục vụ FE. */
    String endFormId;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Result> results = new ArrayList<>();

    /** Đưa giá trị biến {@code variable} vào kết quả với tên {@code formField}. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Result {
        String variable;
        String formField;
    }
}
