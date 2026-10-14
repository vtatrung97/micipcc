package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Đưa giá trị biến {@code variable} vào kết quả với tên {@code formField}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EndResultMapping {
    String variable;
    String formField;
}
