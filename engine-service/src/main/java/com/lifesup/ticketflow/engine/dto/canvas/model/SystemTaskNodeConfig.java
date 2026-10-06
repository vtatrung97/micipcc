package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Cấu hình gọi API nội bộ của system task. */
@Data
public class SystemTaskNodeConfig {
    private String systemId;
    private String apiId;
    private Integer timeout;
    private Integer retry;
    private List<VariableMapping> inputMapping;
    private String outputFieldId;
}
