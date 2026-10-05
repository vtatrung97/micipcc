package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.Data;

/** Cấu hình node bắt đầu. */
@Data
public class StartNodeConfig {
    private String triggerType;
    private String triggerRefId;
}
