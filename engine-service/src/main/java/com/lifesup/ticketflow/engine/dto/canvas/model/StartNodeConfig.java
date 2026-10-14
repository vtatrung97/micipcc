package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** START: các biến của quy trình được khởi tạo từ dữ liệu đầu vào. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class StartNodeConfig implements NodeConfig {
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<StartVariable> variables = new ArrayList<>();
}
