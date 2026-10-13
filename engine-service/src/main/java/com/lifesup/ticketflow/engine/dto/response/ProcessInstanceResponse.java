package com.lifesup.ticketflow.engine.dto.response;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

/** Thông tin phiên chạy; thời gian là epoch millis. */
@Value
@Builder
public class ProcessInstanceResponse {
    String processInstanceId;
    String processDefinitionId;
    String processDefinitionKey;
    String businessKey;
    Status status;
    /** Id phần tử BPMN đang chờ / đang chạy (chỉ khi RUNNING). */
    List<String> activeActivityIds;
    Long startTime;
    Long endTime;
    /** Biến của quy trình, không gồm biến nội bộ (tiền tố "__"). */
    Map<String, Object> variables;
    /** Kết quả END.results khi đã kết thúc. */
    Object output;

    public enum Status {
        RUNNING,
        COMPLETED,
        CANCELLED
    }
}
