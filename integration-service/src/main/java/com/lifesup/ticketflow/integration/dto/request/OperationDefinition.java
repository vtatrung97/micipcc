package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.dto.data.RetryPolicyData;

import java.util.List;
import java.util.Map;

/** Phần định nghĩa API dùng chung giữa request tạo và sửa operation. */
public interface OperationDefinition {

    String getName();

    String getDescription();

    HttpMethod getHttpMethod();

    String getPath();

    Map<String, String> getHeaders();

    Map<String, String> getQueryParams();

    List<OperationInputParam> getInputParams();

    List<OperationOutputParam> getOutputParams();

    JsonNode getRequestSchema();

    JsonNode getResponseSchema();

    String getRequestMapping();

    String getResponseMapping();

    Integer getTimeoutMs();

    RetryPolicyData getRetryPolicy();
}
