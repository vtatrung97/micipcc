package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Cấu hình giao việc cho user task. */
@Data
public class UserTaskNodeConfig {
    private String departmentId;
    private String groupId;
    private String agentId;
    private List<String> outputIds;
}
