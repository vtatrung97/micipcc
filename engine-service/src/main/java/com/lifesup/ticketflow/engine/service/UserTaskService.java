package com.lifesup.ticketflow.engine.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.engine.dto.request.ClaimTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.CompleteTaskRequest;
import com.lifesup.ticketflow.engine.dto.request.TaskSearchRequest;
import com.lifesup.ticketflow.engine.dto.response.TaskDetailResponse;
import com.lifesup.ticketflow.engine.dto.response.TaskResponse;

/**
 * Xử lý task của USER_TASK. Engine tin tưởng service gọi (core) đã kiểm quyền của người dùng;
 * engine chỉ kiểm task tồn tại và đang được giao cho đúng người.
 */
public interface UserTaskService {

    PageResponse<TaskResponse> search(TaskSearchRequest request);

    TaskDetailResponse get(String taskId);

    TaskResponse claim(String taskId, ClaimTaskRequest request);

    void complete(String taskId, CompleteTaskRequest request);
}
