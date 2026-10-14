package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Ghi field {@code apiField} trong kết quả API (cho phép đường dẫn "a.b") vào biến {@code variable}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiOutputMapping {
    String apiField;
    String variable;
    String displayName;
}
