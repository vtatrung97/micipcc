package com.lifesup.ticketflow.engine.dto.flowable;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Payload mẫu đầy đủ do FE gửi khi lưu flow. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SampleFlowPayload {
    String name;
    String description;
    String versionName;
    Long rowVersion;
    JsonNode flowJson;
}
