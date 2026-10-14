package com.lifesup.ticketflow.engine.runtime.assignment;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.task.api.history.HistoricTaskInstance;
import org.springframework.stereotype.Component;

/**
 * Giao lần lượt theo danh sách: lấy người nhận task gần nhất của cùng bước (cùng quy trình, cùng node, mọi phiên bản)
 * rồi chọn người kế tiếp trong danh sách. Trạng thái lấy từ lịch sử task nên không cần lưu thêm và dùng được khi
 * chạy nhiều instance engine.
 *
 * <p>Hai task của cùng bước được tạo đồng thời có thể cùng chọn một người; chấp nhận được với mục đích chia đều.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoundRobinAssigneeSelector implements AssigneeSelector {
    /** Số task gần nhất xét để tìm người nhận trước đó. */
    static final int HISTORY_WINDOW = 20;

    HistoryService historyService;
    RepositoryService repositoryService;

    @Override
    public String select(String processDefinitionId, String taskDefinitionKey, List<String> candidates) {
        if (candidates.isEmpty()) {
            return null;
        }
        String processDefinitionKey = repositoryService.getProcessDefinition(processDefinitionId).getKey();
        List<HistoricTaskInstance> recent = historyService.createHistoricTaskInstanceQuery()
                .processDefinitionKey(processDefinitionKey)
                .taskDefinitionKey(taskDefinitionKey)
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
