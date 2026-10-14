package com.lifesup.ticketflow.engine.service.impl;

import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.engine.common.exception.EngineErrorCode;
import com.lifesup.ticketflow.engine.dto.request.CancelInstanceRequest;
import com.lifesup.ticketflow.engine.dto.request.StartInstanceRequest;
import com.lifesup.ticketflow.engine.dto.response.ProcessInstanceResponse;
import com.lifesup.ticketflow.engine.dto.response.ProcessInstanceResponse.Status;
import com.lifesup.ticketflow.engine.service.ProcessInstanceService;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.engine.HistoryService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.history.HistoricProcessInstance;
import org.flowable.engine.repository.ProcessDefinitionQuery;
import org.flowable.engine.runtime.ProcessInstance;
import org.flowable.engine.runtime.ProcessInstanceBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Phiên chạy quy trình. Dữ liệu đầu vào truyền dưới dạng biến tạm {@code __input}: START map vào biến theo cấu hình,
 * bản thân payload không lưu vào DB.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProcessInstanceServiceImpl implements ProcessInstanceService {
    static final String DEFAULT_CANCEL_REASON = "Cancelled by user";

    RuntimeService runtimeService;
    HistoryService historyService;
    RepositoryService repositoryService;

    @Override
    public ProcessInstanceResponse start(StartInstanceRequest request) {
        boolean hasTenant = StringUtils.hasText(request.getTenantId());
        ProcessDefinitionQuery definitions = repositoryService.createProcessDefinitionQuery()
                .processDefinitionKey(request.getProcessKey());
        if (hasTenant) {
            definitions.processDefinitionTenantId(request.getTenantId());
        }
        if (definitions.count() == 0) {
            throw new AppException(EngineErrorCode.PROCESS_DEFINITION_NOT_FOUND);
        }

        ProcessInstanceBuilder builder = runtimeService.createProcessInstanceBuilder()
                .processDefinitionKey(request.getProcessKey())
                .businessKey(request.getBusinessKey())
                .transientVariable(WorkflowVariables.INPUT, request.getInput());
        if (hasTenant) {
            builder.tenantId(request.getTenantId());
        }
        ProcessInstance instance = builder.start();
        log.info("Started process key={} instance={} businessKey={}",
                request.getProcessKey(), instance.getId(), request.getBusinessKey());
        return get(instance.getId());
    }

    @Override
    public ProcessInstanceResponse get(String processInstanceId) {
        ProcessInstance running = runtimeService.createProcessInstanceQuery()
                .processInstanceId(processInstanceId)
                .singleResult();
        if (running != null) {
            Map<String, Object> variables = runtimeService.getVariables(processInstanceId);
            return ProcessInstanceResponse.builder()
                    .processInstanceId(running.getId())
                    .processDefinitionId(running.getProcessDefinitionId())
                    .processDefinitionKey(running.getProcessDefinitionKey())
                    .businessKey(running.getBusinessKey())
                    .status(Status.RUNNING)
                    .activeActivityIds(runtimeService.getActiveActivityIds(processInstanceId))
                    .startTime(millis(running.getStartTime()))
                    .variables(userVariables(variables))
                    .output(variables.get(WorkflowVariables.OUTPUT))
                    .build();
        }

        HistoricProcessInstance finished = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(processInstanceId)
                .includeProcessVariables()
                .singleResult();
        if (finished == null) {
            throw new AppException(EngineErrorCode.PROCESS_INSTANCE_NOT_FOUND);
        }
        Map<String, Object> variables = finished.getProcessVariables();
        return ProcessInstanceResponse.builder()
                .processInstanceId(finished.getId())
                .processDefinitionId(finished.getProcessDefinitionId())
                .processDefinitionKey(finished.getProcessDefinitionKey())
                .businessKey(finished.getBusinessKey())
                .status(finished.getDeleteReason() == null ? Status.COMPLETED : Status.CANCELLED)
                .activeActivityIds(List.of())
                .startTime(millis(finished.getStartTime()))
                .endTime(millis(finished.getEndTime()))
                .variables(userVariables(variables))
                .output(variables.get(WorkflowVariables.OUTPUT))
                .build();
    }

    @Override
    public void cancel(String processInstanceId, CancelInstanceRequest request) {
        long running = runtimeService.createProcessInstanceQuery().processInstanceId(processInstanceId).count();
        if (running == 0) {
            throw new AppException(EngineErrorCode.PROCESS_INSTANCE_NOT_FOUND);
        }
        String reason = request != null && StringUtils.hasText(request.getReason())
                ? request.getReason()
                : DEFAULT_CANCEL_REASON;
        runtimeService.deleteProcessInstance(processInstanceId, reason);
        log.info("Cancelled process instance {}", processInstanceId);
    }

    /** Bỏ biến nội bộ của engine (tiền tố "__"). */
    private static Map<String, Object> userVariables(Map<String, Object> variables) {
        Map<String, Object> result = new LinkedHashMap<>();
        variables.forEach((name, value) -> {
            if (!name.startsWith(WorkflowVariables.INTERNAL_PREFIX)) {
                result.put(name, value);
            }
        });
        return result;
    }

    private static Long millis(Date date) {
        return date == null ? null : date.getTime();
    }
}
