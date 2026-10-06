package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.Data;

/** Liên kết JOIN với gateway đã sinh ra nó. */
@Data
public class JoinNodeConfig {
    private String gatewayNodeId;
}
