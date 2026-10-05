package com.lifesup.ticketflow.engine.dto.canvas.model;

import java.util.List;
import lombok.Data;

/** Cấu hình gọi một quy trình con. */
@Data
public class SubProcessNodeConfig {
    private String subProcessId;
    private List<VariableMapping> inputMapping;
    private List<VariableMapping> outputMapping;
}
