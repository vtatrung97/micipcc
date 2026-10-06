package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Một nhánh có điều kiện của gateway. */
@Data
public class GatewayCase {
    private String id;
    private String name;
    private List<GatewayCondition> conditions;
}
