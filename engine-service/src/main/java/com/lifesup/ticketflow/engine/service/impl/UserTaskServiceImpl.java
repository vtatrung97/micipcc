package com.lifesup.ticketflow.engine.service.impl;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.engine.exception.EngineErrorCode;
import com.lifesup.ticketflow.engine.dto.request.ClaimTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.CompleteTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.TaskSearchRequest;
import com.lifesup.ticketflow.engine.dto.response.TaskDetailResponse;
import com.lifesup.ticketflow.engine.dto.response.TaskResponse;
import com.lifesup.ticketflow.engine.node.usertask.UserTaskNodeConfig;
import com.lifesup.ticketflow.engine.service.UserTaskService;
import com.lifesup.ticketflow.engine.workflow.runtime.NodeConfigReader;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.common.engine.impl.identity.Authentication;
import org.flowable.engine.TaskService;
import org.flowable.task.api.Task;
import org.flowable.task.api.TaskQuery;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Task của USER_TASK. Dữ liệu form ↔ biến theo cấu hình node:
 * <pre>
 *  xem task      : inputs  {biến → formField}  → formData điền sẵn
 *  hoàn thành    : outputs {formField → biến}  ← formData người dùng nhập
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserTaskServiceImpl implements UserTaskService {
    TaskService taskService;
    NodeConfigReader configReader;

    @Override
    public PageResponse<TaskResponse> search(TaskSearchRequest request) {
        TaskQuery query = taskService.createTaskQuery().active();
        if (StringUtils.hasText(request.getAssignee())) {
            query.taskAssignee(request.getAssignee());
        }
        boolean hasUser = StringUtils.hasText(request.getCandidateUser());
        boolean hasGroups = request.getCandidateGroups() != null && !request.getCandidateGroups().isEmpty();
        if (hasUser && hasGroups) {
            // Flowable không cho gọi taskCandidateUser và taskCandidateGroupIn cùng lúc ngoài khối or()
            query.or()
                    .taskCandidateUser(request.getCandidateUser())
                    .taskCandidateGroupIn(request.getCandidateGroups())
                    .endOr();
        } else if (hasUser) {
            query.taskCandidateUser(request.getCandidateUser());
        } else if (hasGroups) {
            query.taskCandidateGroupIn(request.getCandidateGroups());
        }
        if (StringUtils.hasText(request.getProcessInstanceId())) {
            query.processInstanceId(request.getProcessInstanceId());
        }

        long total = query.count();
        List<TaskResponse> content = query.orderByTaskCreateTime().desc()
                .listPage((request.getPage() - 1) * request.getSize(), request.getSize())
                .stream()
                .map(UserTaskServiceImpl::toResponse)
                .toList();
        return new PageResponse<>(new PageImpl<>(content, PageRequest.of(request.getPage() - 1, request.getSize()), total));
    }

    @Override
    public TaskDetailResponse get(String taskId) {
        Task task = findTask(taskId);
        UserTaskNodeConfig config = config(task);
        Map<String, Object> variables = taskService.getVariables(taskId,
                config.getInputs().stream().map(UserTaskNodeConfig.Input::getVariable).toList());
        Map<String, Object> formData = new LinkedHashMap<>();
        for (UserTaskNodeConfig.Input input : config.getInputs()) {
            formData.put(input.getFormField(), variables.get(input.getVariable()));
        }
        return new TaskDetailResponse(toResponse(task), formData);
    }

    @Override
    public TaskResponse claim(String taskId, ClaimTaskRequest request) {
        findTask(taskId);
        taskService.claim(taskId, request.getUserId());
        return toResponse(findTask(taskId));
    }

    /** Task chưa giao thì người hoàn thành nhận luôn; đã giao cho người khác thì từ chối. */
    @Override
    public void complete(String taskId, CompleteTaskRequest request) {
        Task task = findTask(taskId);
        String userId = request.getUserId();
        if (task.getAssignee() == null) {
            taskService.claim(taskId, userId);
        } else if (!task.getAssignee().equals(userId)) {
            throw new AppException(EngineErrorCode.TASK_NOT_ASSIGNED_TO_USER);
        }

        Map<String, Object> formData = request.getFormData() != null ? request.getFormData() : Map.of();
        Map<String, Object> variables = new HashMap<>();
        for (UserTaskNodeConfig.Output output : config(task).getOutputs()) {
            if (formData.containsKey(output.getFormField())) {
                variables.put(output.getVariable(), formData.get(output.getFormField()));
            }
        }

        // Ghi người thực hiện vào lịch sử Flowable
        Authentication.setAuthenticatedUserId(userId);
        try {
            taskService.complete(taskId, variables);
        } finally {
            Authentication.setAuthenticatedUserId(null);
        }
        log.info("Completed task {} by {}", taskId, userId);
    }

    private Task findTask(String taskId) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw new AppException(EngineErrorCode.TASK_NOT_FOUND);
        }
        return task;
    }

    private UserTaskNodeConfig config(Task task) {
        return configReader.read(task.getProcessDefinitionId(), task.getTaskDefinitionKey(), UserTaskNodeConfig.class);
    }

    private static TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .name(task.getName())
                .taskDefinitionKey(task.getTaskDefinitionKey())
                .processInstanceId(task.getProcessInstanceId())
                .processDefinitionId(task.getProcessDefinitionId())
                .assignee(task.getAssignee())
                .category(task.getCategory())
                .formKey(task.getFormKey())
                .createTime(millis(task.getCreateTime()))
                .dueDate(millis(task.getDueDate()))
                .build();
    }

    private static Long millis(Date date) {
        return date == null ? null : date.getTime();
    }
}
