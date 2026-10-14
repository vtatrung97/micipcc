package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.common.enums.LogicOperator;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một nhánh của gateway; {@code id} cũng là sourceHandle của edge đi ra nhánh đó. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GatewayCase {
    String id;
    String name;
    /** Mặc định AND khi không truyền. */
    LogicOperator logicOperator;
    /** Gateway parallel không có điều kiện. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<GatewayCondition> conditions = new ArrayList<>();

    public LogicOperator effectiveLogicOperator() {
        return logicOperator != null ? logicOperator : LogicOperator.AND;
    }
}
