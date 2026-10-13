package com.lifesup.ticketflow.engine.node.gateway;

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
 * GATEWAY_EXCLUSIVE / GATEWAY_INCLUSIVE / GATEWAY_PARALLEL. Nhánh mặc định và nhánh lỗi không nằm trong
 * {@code cases}, chỉ thể hiện bằng edge có sourceHandle {@code default} / {@code error}.
 */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GatewayNodeConfig implements NodeConfig {
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Case> cases = new ArrayList<>();
    /** Node JOIN gộp các nhánh của gateway này. */
    String joinNodeId;

    /** Một nhánh; {@code id} cũng là sourceHandle của edge đi ra nhánh đó. */
    @Data
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Case {
        String id;
        String name;
        /** Mặc định AND khi không truyền. */
        LogicOperator logicOperator;
        /** Gateway parallel không có điều kiện. */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        List<Condition> conditions = new ArrayList<>();
    }

    /** Một điều kiện: {@code <biến field> <operator> <value>}. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Condition {
        /** Tên biến của quy trình. */
        String field;
        Operator operator;
        /** Giá trị so sánh dạng chuỗi; IN / NOT_IN viết dạng "a, b, c". */
        String value;
    }

    /** Cách kết hợp các điều kiện trong một nhánh. */
    public enum LogicOperator {
        AND,
        OR
    }

    /** Toán tử so sánh, cách so sánh xem ConditionOperators. */
    public enum Operator {
        EQ, NEQ, GT, GTE, LT, LTE, IN, NOT_IN, CONTAINS;

        /** Toán tử so sánh số: giá trị cấu hình phải là số. */
        public boolean isNumeric() {
            return this == GT || this == GTE || this == LT || this == LTE;
        }

        /** EQ / NEQ cho phép giá trị rỗng (so với chuỗi rỗng), các toán tử còn lại bắt buộc có giá trị. */
        public boolean requiresValue() {
            return this != EQ && this != NEQ;
        }
    }
}
