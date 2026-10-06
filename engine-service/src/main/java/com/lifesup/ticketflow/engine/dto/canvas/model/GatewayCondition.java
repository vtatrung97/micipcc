package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.Data;

/** Một phép so sánh trong gateway case. */
@Data
public class GatewayCondition {
    private String field;
    private String operator;
    private String value;
}
