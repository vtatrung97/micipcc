package com.lifesup.ticketflow.engine.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Map;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Kết quả gọi API. Lỗi kỹ thuật (không kết nối được, 5xx) không trả về đây mà ném IntegrationException. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationExecuteResult {
    /** SUCCESS hoặc BUSINESS_ERROR (hệ thống ngoài từ chối / đã hết số lần thử lại). */
    Status status;
    /** Kết quả đã qua response_mapping, key là apiField. */
    Map<String, Object> output;
    /** Mã lỗi nghiệp vụ khi BUSINESS_ERROR. */
    String errorCode;
    /** Mô tả lỗi khi BUSINESS_ERROR. */
    String errorMessage;

    public enum Status {
        SUCCESS,
        BUSINESS_ERROR
    }

    public static OperationExecuteResult success(Map<String, Object> output) {
        return new OperationExecuteResult(Status.SUCCESS, output, null, null);
    }

    @JsonIgnore
    public boolean isSuccess() {
        return status == Status.SUCCESS;
    }
}
