package com.lifesup.ticketflow.engine.dto.response;

import lombok.Builder;
import lombok.Value;

/** Kết quả deploy; core lưu deploymentId, processDefinitionKey và bpmnXml vào template_version. */
@Value
@Builder
public class DeploymentResponse {
    String deploymentId;
    String processDefinitionId;
    String processDefinitionKey;
    int processDefinitionVersion;
    String bpmnXml;
}
