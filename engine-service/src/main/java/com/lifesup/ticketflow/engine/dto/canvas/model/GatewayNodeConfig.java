package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Cấu hình chung của ba loại gateway. */
@Data
public class GatewayNodeConfig {
    private List<GatewayCase> cases;
    private String joinNodeId;
}
