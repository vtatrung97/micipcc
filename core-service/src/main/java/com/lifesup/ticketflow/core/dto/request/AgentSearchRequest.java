package com.lifesup.ticketflow.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentSearchRequest {

    /** Tìm tương đối theo username, trống = tất cả. */
    String username;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
