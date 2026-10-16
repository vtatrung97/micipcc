package com.lifesup.ticketflow.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FormSearchRequest {

    /** Tìm tương đối theo mã / tên / tiêu đề, trống = tất cả. */
    String keyword;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(1000)
    int size = 20;
}
