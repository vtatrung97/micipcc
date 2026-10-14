package com.lifesup.ticketflow.engine.runtime.support;

import com.lifesup.ticketflow.engine.client.dto.ExecutionContextInfo;
import org.flowable.engine.delegate.DelegateExecution;

/** Thông tin của bước đang chạy gửi kèm khi gọi integration-service. */
public final class ExecutionContexts {

    private ExecutionContexts() {
    }

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
