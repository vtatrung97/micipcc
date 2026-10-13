package com.lifesup.ticketflow.integration.dto.request;

import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationSearchRequest {

    /** Tìm theo mã hoặc tên. */
    String keyword;
    Long systemId;
    Long connectionId;
    OperationStatus status;
    HttpMethod httpMethod;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
