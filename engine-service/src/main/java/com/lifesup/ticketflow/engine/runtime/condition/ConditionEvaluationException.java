package com.lifesup.ticketflow.engine.runtime.condition;

/** Không đánh giá được điều kiện (thiếu dữ liệu hoặc sai kiểu). Gateway có nhánh error sẽ đi nhánh error. */
public class ConditionEvaluationException extends RuntimeException {
    public ConditionEvaluationException(String message) {
        super(message);
    }
}
