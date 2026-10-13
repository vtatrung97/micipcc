package com.lifesup.ticketflow.integration.dto.response;

import com.lifesup.ticketflow.integration.common.enums.ConnectionTestError;
import com.lifesup.ticketflow.integration.common.enums.ConnectionTestStage;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Kết quả test kết nối (chỉ kiểm tra DNS / TCP / TLS / HTTP, không gọi API nghiệp vụ). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionTestResponse {
    boolean success;
    @Schema(description = "Bước bị lỗi, null khi thành công")
    ConnectionTestStage stage;
    @Schema(description = "Mã lỗi, null khi thành công")
    ConnectionTestError errorCode;
    @Schema(description = "HTTP status máy chủ trả về (có khi đã tới bước HTTP)")
    Integer httpStatus;
    Long durationMs;
    String message;
    /** Epoch millis. */
    Long testedAt;
}
