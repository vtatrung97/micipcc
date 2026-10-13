package com.lifesup.ticketflow.engine.node.subprocess;

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

/**
 * SUB_PROCESS: gọi quy trình con. {@code subProcessId} là mã template của quy trình con, cũng là process key
 * khi deploy.
 *
 * <pre>
 *  cha: inputs  {subField ← biến}  ──__input──►  con: START.variables (formField = subField)
 *  con: END.results {formField ← biến} ──__output──► cha: outputs {biến ← subField}
 * </pre>
 */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubProcessNodeConfig implements NodeConfig {
    String subProcessId;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Input> inputs = new ArrayList<>();
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Output> outputs = new ArrayList<>();

    /** Truyền biến {@code variable} của quy trình cha vào field đầu vào {@code subField} của quy trình con. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Input {
        String subField;
        String variable;
    }

    /** Ghi kết quả {@code subField} của quy trình con vào biến {@code variable} của quy trình cha. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Output {
        String subField;
        String variable;
        String displayName;
    }
}
