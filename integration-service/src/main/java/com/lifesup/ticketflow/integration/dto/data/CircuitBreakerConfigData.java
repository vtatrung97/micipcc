package com.lifesup.ticketflow.integration.dto.data;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Cấu hình circuit breaker (Resilience4j) của connection. Bỏ trống field nào thì dùng mặc định khi gọi API. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CircuitBreakerConfigData {

    @Schema(description = "Tỉ lệ lỗi (%) để ngắt mạch", example = "50")
    @Min(value = 1, message = "{validation.circuitBreaker.percent.range}")
    @Max(value = 100, message = "{validation.circuitBreaker.percent.range}")
    Integer failureRateThreshold;

    @Schema(description = "Tỉ lệ gọi chậm (%) để ngắt mạch", example = "100")
    @Min(value = 1, message = "{validation.circuitBreaker.percent.range}")
    @Max(value = 100, message = "{validation.circuitBreaker.percent.range}")
    Integer slowCallRateThreshold;

    @Schema(description = "Gọi lâu hơn (ms) thì tính là chậm", example = "3000")
    @Min(value = 1, message = "{validation.circuitBreaker.positive}")
    Integer slowCallDurationThresholdMs;

    @Schema(description = "Thời gian (ms) giữ trạng thái ngắt trước khi thử lại", example = "30000")
    @Min(value = 1, message = "{validation.circuitBreaker.positive}")
    Integer waitDurationInOpenStateMs;

    @Schema(description = "Số lần gọi gần nhất dùng để tính tỉ lệ", example = "20")
    @Min(value = 1, message = "{validation.circuitBreaker.positive}")
    Integer slidingWindowSize;

    @Schema(description = "Số lần gọi tối thiểu trước khi tính tỉ lệ", example = "10")
    @Min(value = 1, message = "{validation.circuitBreaker.positive}")
    Integer minimumNumberOfCalls;

    @Schema(description = "Số lần gọi thử khi nửa mở", example = "3")
    @Min(value = 1, message = "{validation.circuitBreaker.positive}")
    Integer permittedNumberOfCallsInHalfOpenState;
}
