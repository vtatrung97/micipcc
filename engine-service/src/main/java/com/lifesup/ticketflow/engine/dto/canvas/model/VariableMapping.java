package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.Data;

/** Một dòng ánh xạ dữ liệu giữa hai biến. */
@Data
public class VariableMapping {
    private String input;
    private String output;
}
