package com.lifesup.ticketflow.engine.client.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;

/** Bước đang chạy của quy trình, gửi kèm để integration-service ghi log / truy vết. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExecutionContextInfo {
    String processInstanceId;
    String processDefinitionId;
    String activityId;
    String businessKey;

    public static ExecutionContextInfo of(DelegateExecution execution) {
        return new ExecutionContextInfo(execution.getProcessInstanceId(), execution.getProcessDefinitionId(),
                execution.getCurrentActivityId(), execution.getProcessInstanceBusinessKey());
    }

    /**
     * Khoá chống gọi trùng: giống nhau giữa các lần async executor thử lại cùng một bước, nên integration-service
     * nhận ra lần gọi lặp và không thực hiện lại (VD không gửi SMS hai lần).
     */
    public static String idempotencyKey(DelegateExecution execution) {
        return execution.getProcessInstanceId() + ":" + execution.getCurrentActivityId() + ":" + execution.getId();
    }
}
