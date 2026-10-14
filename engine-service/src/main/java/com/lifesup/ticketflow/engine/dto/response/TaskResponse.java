package com.lifesup.ticketflow.engine.dto.response;

import lombok.Builder;
import lombok.Value;

/** Một task đang mở; thời gian là epoch millis. */
@Value
@Builder
public class TaskResponse {
    String id;
    String name;
    /** Id phần tử BPMN của node USER_TASK. */
    String taskDefinitionKey;
    String processInstanceId;
    String processDefinitionId;
    String assignee;
    /** Phòng ban xử lý (departmentId của node). */
    String category;
    /** Form hiển thị (formId của node). */
    String formKey;
    Long createTime;
    Long dueDate;
}
