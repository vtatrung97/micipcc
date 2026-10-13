package com.lifesup.ticketflow.engine.runtime.assignment;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.enums.AssignType;
import com.lifesup.ticketflow.engine.dto.canvas.model.UserTaskNodeConfig;
import com.lifesup.ticketflow.engine.runtime.NodeConfigReader;
import java.time.Instant;
import java.util.Date;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/**
 * Người xử lý và hạn xử lý của USER_TASK, dùng trong biểu thức assignee / dueDate của user task
 * (execution đang đứng ở user task nên đọc được cấu hình node).
 *
 * <ul>
 *   <li>AUTO: chọn một người theo chiến lược (ROUND_ROBIN);</li>
 *   <li>MANUAL chỉ có đúng một người và không có nhóm: giao thẳng cho người đó;</li>
 *   <li>còn lại: không giao, các candidate tự nhận việc.</li>
 * </ul>
 */
@Component(BpmnExpressions.BEAN_USER_TASK_ASSIGNMENT)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserTaskAssignment {
    NodeConfigReader configReader;
    AssigneeSelector assigneeSelector;

    public String assignee(DelegateExecution execution) {
        UserTaskNodeConfig config = configReader.read(execution, UserTaskNodeConfig.class);
        if (config.getAssignType() == AssignType.AUTO) {
            return assigneeSelector.select(execution.getProcessDefinitionId(), execution.getCurrentActivityId(),
                    config.getAgentIds());
        }
        boolean singleAgent = config.getAgentIds().size() == 1 && config.getGroupIds().isEmpty();
        return singleAgent ? config.getAgentIds().get(0) : null;
    }

    /** Thời điểm tạo + SLA; node không có SLA trả null. */
    public Date dueDate(DelegateExecution execution) {
        UserTaskNodeConfig config = configReader.read(execution, UserTaskNodeConfig.class);
        if (config.getSlaValue() == null || config.getSlaUnit() == null) {
            return null;
        }
        return Date.from(Instant.now().plus(config.getSlaUnit().toDuration(config.getSlaValue())));
    }
}
