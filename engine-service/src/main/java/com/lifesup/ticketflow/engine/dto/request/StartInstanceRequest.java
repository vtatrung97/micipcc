package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Khởi tạo một phiên chạy theo phiên bản deploy mới nhất của quy trình. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartInstanceRequest {
    @NotBlank(message = "{validation.processKey.required}")
    String processKey;

    /** Mã hồ sơ (VD PAKN-2026-00001), quy trình con kế thừa. */
    String businessKey;

    /** Dữ liệu đầu vào: dữ liệu form (MANUAL) hoặc payload API (AUTO), START map vào biến theo cấu hình. */
    Map<String, Object> input = new LinkedHashMap<>();

    String tenantId;
}
