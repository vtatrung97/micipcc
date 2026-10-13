package com.lifesup.ticketflow.integration.dto.request;

import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExternalSystemSearchRequest {

    /** Tìm theo mã hoặc tên. */
    String keyword;
    Status status;
    Environment environment;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
