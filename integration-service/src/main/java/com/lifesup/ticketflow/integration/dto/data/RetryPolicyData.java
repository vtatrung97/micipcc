package com.lifesup.ticketflow.integration.dto.data;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/** Chính sách retry khi gọi API. Bỏ trống field nào thì dùng mặc định khi gọi API. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RetryPolicyData {

    @Schema(description = "Số lần gọi tối đa, tính cả lần đầu", example = "3")
    @Min(value = 1, message = "{validation.retryPolicy.maxAttempts.range}")
    @Max(value = 10, message = "{validation.retryPolicy.maxAttempts.range}")
    Integer maxAttempts;

    @Schema(description = "Thời gian chờ (ms) trước lần thử lại đầu tiên", example = "500")
    @Min(value = 0, message = "{validation.retryPolicy.backoffMs.min}")
    Integer backoffMs;

    @Schema(description = "Hệ số tăng thời gian chờ sau mỗi lần thử", example = "2")
    @DecimalMin(value = "1", message = "{validation.retryPolicy.backoffMultiplier.range}")
    @DecimalMax(value = "10", message = "{validation.retryPolicy.backoffMultiplier.range}")
    Double backoffMultiplier;

    @Schema(description = "Mã HTTP lỗi thì thử lại", example = "[502, 503, 504]")
    @Size(max = 50, message = "{validation.retryPolicy.retryOnStatus.size}")
    List<@NotNull(message = "{validation.retryPolicy.retryOnStatus.range}")
            @Min(value = 400, message = "{validation.retryPolicy.retryOnStatus.range}")
            @Max(value = 599, message = "{validation.retryPolicy.retryOnStatus.range}") Integer> retryOnStatus;

    @Schema(description = "Hết thời gian chờ thì thử lại", example = "true")
    Boolean retryOnTimeout;
}
