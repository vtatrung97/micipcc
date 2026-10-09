package com.lifesup.ticketflow.core.dto.request;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowSearchRequest {

    String keyword;
    String name;
    String code;
    TicketCallFlowStatus status;
    Boolean hasDraft;
    Integer publishedVersionNo;

    Long updatedFrom;
    Long updatedTo;
    Long publishedFrom;
    Long publishedTo;

    String sortBy;
    @Pattern(regexp = "(?i)asc|desc", message = "{validation.ticketCallFlow.sortDir.pattern}")
    String sortDir;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
