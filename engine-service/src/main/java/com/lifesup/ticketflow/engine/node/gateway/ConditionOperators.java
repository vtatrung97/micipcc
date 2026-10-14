package com.lifesup.ticketflow.engine.node.gateway;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * So sánh giá trị biến với giá trị cấu hình (luôn là chuỗi) theo toán tử.
 *
 * <ul>
 *   <li>EQ / NEQ / IN / NOT_IN: hai bên đều là số thì so theo số ("3" = "3.0"), còn lại so chuỗi sau khi trim,
 *       phân biệt hoa thường. Biến null bằng chuỗi rỗng.</li>
 *   <li>IN / NOT_IN: giá trị cấu hình là danh sách cách nhau bởi dấu phẩy.</li>
 *   <li>GT / GTE / LT / LTE: hai bên phải là số; biến null hoặc không phải số → {@link EvaluationException}.</li>
 *   <li>CONTAINS: biến là danh sách thì có phần tử bằng giá trị; là chuỗi thì chứa chuỗi con; null → false.</li>
 * </ul>
 */
final class ConditionOperators {

    private ConditionOperators() {
    }

    static boolean test(GatewayNodeConfig.Operator operator, Object actual, String expected) {
        String value = expected == null ? "" : expected.trim();
        return switch (operator) {
            case EQ -> equalsValue(actual, value);
            case NEQ -> !equalsValue(actual, value);
            case GT -> compare(actual, value) > 0;
            case GTE -> compare(actual, value) >= 0;
            case LT -> compare(actual, value) < 0;
            case LTE -> compare(actual, value) <= 0;
            case IN -> splitList(value).stream().anyMatch(item -> equalsValue(actual, item));
            case NOT_IN -> splitList(value).stream().noneMatch(item -> equalsValue(actual, item));
            case CONTAINS -> contains(actual, value);
        };
    }

    static List<String> splitList(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .toList();
    }

    private static boolean equalsValue(Object actual, String expected) {
        if (actual == null) {
            return expected.isEmpty();
        }
        String text = String.valueOf(actual).trim();
        Optional<BigDecimal> left = toNumber(text);
        Optional<BigDecimal> right = toNumber(expected);
        if (left.isPresent() && right.isPresent()) {
            return left.get().compareTo(right.get()) == 0;
        }
        return text.equals(expected);
    }

    private static int compare(Object actual, String expected) {
        if (actual == null) {
            throw new EvaluationException("Biến chưa có giá trị để so sánh với " + expected);
        }
        BigDecimal left = toNumber(String.valueOf(actual).trim())
                .orElseThrow(() -> new EvaluationException("Giá trị biến không phải số: " + actual));
        BigDecimal right = toNumber(expected)
                .orElseThrow(() -> new EvaluationException("Giá trị so sánh không phải số: " + expected));
        return left.compareTo(right);
    }

    private static boolean contains(Object actual, String expected) {
        if (actual instanceof Collection<?> collection) {
            return collection.stream().anyMatch(item -> equalsValue(item, expected));
        }
        return actual != null && String.valueOf(actual).contains(expected);
    }

    private static Optional<BigDecimal> toNumber(String value) {
        if (value.isEmpty()) {
            return Optional.empty();
        }
        try {
            return Optional.of(new BigDecimal(value));
        } catch (NumberFormatException exception) {
            return Optional.empty();
        }
    }

    /** Không đánh giá được điều kiện (thiếu dữ liệu hoặc sai kiểu). Gateway có nhánh error sẽ đi nhánh error. */
    static class EvaluationException extends RuntimeException {
        EvaluationException(String message) {
            super(message);
        }
    }
}
