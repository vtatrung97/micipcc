package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Hoàn thành task: dữ liệu form được ghi vào biến theo outputs của node. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompleteTaskRequest {
    @NotBlank(message = "{validation.userId.required}")
    String userId;

    /** {formField: giá trị}. Field không khai báo trong outputs bị bỏ qua. */
    Map<String, Object> formData = new LinkedHashMap<>();
}
