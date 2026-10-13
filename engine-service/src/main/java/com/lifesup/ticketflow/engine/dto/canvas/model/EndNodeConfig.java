package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** END: kết quả trả ra của quy trình (core hiển thị / quy trình cha nhận qua SUB_PROCESS.outputs). */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class EndNodeConfig implements NodeConfig {
    /** Form hiển thị kết quả, chỉ phục vụ FE. */
    String endFormId;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<EndResultMapping> results = new ArrayList<>();
}
