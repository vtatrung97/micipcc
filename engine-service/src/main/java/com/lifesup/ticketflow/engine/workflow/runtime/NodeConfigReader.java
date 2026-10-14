package com.lifesup.ticketflow.engine.workflow.runtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.workflow.model.NodeConfig;
import com.lifesup.ticketflow.engine.workflow.bpmn.BpmnExtensions;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

/**
 * Bean runtime dùng để đọc cấu hình node (tf:config) từ BPMN đã deploy, theo process definition và id phần tử.
 * Process definition không đổi sau khi deploy nên kết quả được cache.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NodeConfigReader {
    RepositoryService repositoryService;
    ObjectMapper objectMapper;
    ConcurrentMap<String, NodeConfig> cache = new ConcurrentHashMap<>();

    /** Cấu hình của phần tử đang chạy (service task, listener của start / end event, biểu thức của user task). */
    public <T extends NodeConfig> T read(DelegateExecution execution, Class<T> type) {
        return read(execution.getProcessDefinitionId(), execution.getCurrentActivityId(), type);
    }

    public <T extends NodeConfig> T read(String processDefinitionId, String elementId, Class<T> type) {
        NodeConfig config = cache.computeIfAbsent(processDefinitionId + "#" + elementId,
                ignored -> parse(processDefinitionId, elementId, type));
        return type.cast(config);
    }

    /** Nội dung phần mở rộng tf:{name} của phần tử. */
    public String readExtension(String processDefinitionId, String elementId, String name) {
        FlowElement element = repositoryService.getBpmnModel(processDefinitionId).getFlowElement(elementId);
        if (element == null) {
            throw new IllegalStateException("Element " + elementId + " not found in " + processDefinitionId);
        }
        return BpmnExtensions.read(element, name)
                .orElseThrow(() -> new IllegalStateException("Missing tf:" + name + " on " + elementId));
    }

    private <T extends NodeConfig> T parse(String processDefinitionId, String elementId, Class<T> type) {
        String json = readExtension(processDefinitionId, elementId, BpmnExtensions.CONFIG);
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Invalid tf:config on " + elementId, exception);
        }
    }
}
