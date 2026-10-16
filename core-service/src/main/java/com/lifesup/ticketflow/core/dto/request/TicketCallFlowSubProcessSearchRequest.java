package com.lifesup.ticketflow.core.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowSubProcessSearchRequest {

    /** Tìm tương đối theo mã / tên quy trình, trống = tất cả. */
    String keyword;

    @Schema(description = "Id quy trình đang thiết kế, bỏ khỏi danh sách để không tự gọi chính nó", type = "string")
    Long excludeId;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(1000)
    int size = 20;
}
