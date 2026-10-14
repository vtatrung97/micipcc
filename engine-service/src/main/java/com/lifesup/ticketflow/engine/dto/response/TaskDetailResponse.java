package com.lifesup.ticketflow.engine.dto.response;

import java.util.Map;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Task kèm dữ liệu điền sẵn cho form. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskDetailResponse {
    TaskResponse task;
    /** {formField: giá trị biến} theo inputs của node. */
    Map<String, Object> formData;
}
