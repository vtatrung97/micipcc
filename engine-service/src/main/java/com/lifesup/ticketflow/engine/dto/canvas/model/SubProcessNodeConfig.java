package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
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
public final class SubProcessNodeConfig implements NodeConfig {
    String subProcessId;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<SubProcessInputMapping> inputs = new ArrayList<>();
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<SubProcessOutputMapping> outputs = new ArrayList<>();
}
