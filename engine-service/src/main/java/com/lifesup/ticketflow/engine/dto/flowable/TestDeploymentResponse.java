package com.lifesup.ticketflow.engine.dto.flowable;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/** Thông tin deployment trả về từ endpoint test. */
@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TestDeploymentResponse {
    String deploymentId;
    String deploymentName;
    String processDefinitionId;
    String processDefinitionKey;
    Integer processDefinitionVersion;
    String resourceName;
    String bpmnXml;
}
