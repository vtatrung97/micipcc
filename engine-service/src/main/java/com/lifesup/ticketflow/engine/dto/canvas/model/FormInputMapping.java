package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Điền sẵn field {@code formField} của form bằng giá trị biến {@code variable}. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FormInputMapping {
    String variable;
    String formField;
}
