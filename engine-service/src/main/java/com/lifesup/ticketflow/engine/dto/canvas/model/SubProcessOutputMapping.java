package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Ghi kết quả {@code subField} của quy trình con vào biến {@code variable} của quy trình cha. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubProcessOutputMapping {
    String subField;
    String variable;
    String displayName;
}
