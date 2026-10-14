package com.lifesup.ticketflow.engine.client.dto;

import java.util.Map;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Yêu cầu gọi một API đã khai báo trong integration-service. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationExecuteRequest {
    /** Mã hệ thống ngoài. */
    String systemId;
    /** {apiParam: giá trị}, integration-service dựng request thật bằng request_mapping. */
    Map<String, Object> input;
    /** Ghi đè timeout của operation, null = theo operation. */
    Integer timeoutSeconds;
    /** Ghi đè số lần thử lại của operation, null = theo operation. */
    Integer retry;
    /** Khoá chống thực hiện trùng khi engine gọi lại. */
    String idempotencyKey;
    ExecutionContextInfo context;
}
