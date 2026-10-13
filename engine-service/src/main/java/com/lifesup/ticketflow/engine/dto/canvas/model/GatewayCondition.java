package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.lifesup.ticketflow.engine.common.enums.ConditionOperator;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một điều kiện: {@code <biến field> <operator> <value>}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GatewayCondition {
    /** Tên biến của quy trình. */
    String field;
    ConditionOperator operator;
    /** Giá trị so sánh dạng chuỗi; IN / NOT_IN viết dạng "a, b, c". */
    String value;
}
