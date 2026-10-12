package com.lifesup.ticketflow.engine.dto.flowable;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/** Thông tin process instance được endpoint test khởi tạo. */
@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TestProcessRunResponse {
    String processInstanceId;
    String processDefinitionId;
    String processDefinitionKey;
    boolean ended;
}
