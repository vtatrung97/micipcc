package com.lifesup.ticketflow.engine.dto.flowable;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Yêu cầu chuyển một Canvas JSON thành mô hình BPMN. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversionCommand {
    String processKey;
    String processName;
    String modelJson;
}
