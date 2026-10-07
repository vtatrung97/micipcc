package com.lifesup.ticketflow.integration.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HealthCheckResponse {
    String service;
    String status;
    /** Trạng thái từng thành phần: db, redis, diskSpace... */
    Map<String, String> components;
}
