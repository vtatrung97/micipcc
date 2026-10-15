package com.lifesup.ticketflow.engine.node.usertask;

import com.lifesup.ticketflow.engine.node.usertask.UserTaskNodeConfig.AssignType;
import com.lifesup.ticketflow.engine.workflow.runtime.NodeConfigReader;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.task.api.history.HistoricTaskInstance;
import org.springframework.stereotype.Component;

/**
 * Người xử lý và hạn xử lý của USER_TASK, dùng trong biểu thức assignee / dueDate của user task
 * (execution đang đứng ở user task nên đọc được cấu hình node).
 *
 * <ul>
 *   <li>AUTO: chọn một người theo chiến lược (hiện chỉ có ROUND_ROBIN);</li>
 *   <li>MANUAL chỉ có đúng một người và không có nhóm: giao thẳng cho người đó;</li>
 *   <li>còn lại: không giao, các candidate tự nhận việc.</li>
 * </ul>
 */
@Component(UserTaskAssignment.BEAN)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserTaskAssignment {
    /** Tên bean đã ghi vào BPMN đã deploy, không được đổi. */
    public static final String BEAN = "userTaskAssignment";
    /** Số task gần nhất xét để tìm người nhận trước đó khi giao lần lượt. */
    static final int HISTORY_WINDOW = 20;

    NodeConfigReader configReader;
    HistoryService historyService;
    RepositoryService repositoryService;

    public String assignee(DelegateExecution execution) {
        UserTaskNodeConfig config = configReader.read(execution, UserTaskNodeConfig.class);
        if (config.getAssignType() == AssignType.AUTO) {
            return roundRobin(execution, config.getAgentIds());
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

    /**
     * Giao lần lượt: lấy người nhận task gần nhất của cùng bước (cùng quy trình, cùng node, mọi phiên bản) rồi chọn
     * người kế tiếp trong danh sách. Trạng thái lấy từ lịch sử task nên không cần lưu thêm và chạy được nhiều
     * instance engine. Hai task cùng bước tạo đồng thời có thể trùng người; chấp nhận được với mục đích chia đều.
     */
    private String roundRobin(DelegateExecution execution, List<String> candidates) {
        if (candidates.isEmpty()) {
            return null;
        }
        String processDefinitionKey = repositoryService.getProcessDefinition(execution.getProcessDefinitionId()).getKey();
        List<HistoricTaskInstance> recent = historyService.createHistoricTaskInstanceQuery()
                .processDefinitionKey(processDefinitionKey)
                .taskDefinitionKey(execution.getCurrentActivityId())
                .orderByTaskCreateTime().desc()
                .listPage(0, HISTORY_WINDOW);
        int lastIndex = recent.stream()
                .map(HistoricTaskInstance::getAssignee)
                .filter(candidates::contains)
                .findFirst()
                .map(candidates::indexOf)
                .orElse(-1);
        return candidates.get((lastIndex + 1) % candidates.size());
    }
}
