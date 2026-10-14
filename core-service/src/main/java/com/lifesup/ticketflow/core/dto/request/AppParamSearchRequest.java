package com.lifesup.ticketflow.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppParamSearchRequest {

    /** Loại tham số, so khớp tuyệt đối. */
    @NotBlank(message = "{validation.appParam.type.required}")
    String type;

    /** Tìm tương đối theo tên, trống = tất cả. */
    String name;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
