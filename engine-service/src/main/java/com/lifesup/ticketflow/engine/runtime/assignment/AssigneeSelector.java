package com.lifesup.ticketflow.engine.runtime.assignment;

import java.util.List;

/** Chọn người xử lý cho USER_TASK giao tự động. */
public interface AssigneeSelector {

    /**
     * Một người trong {@code candidates} cho bước {@code taskDefinitionKey} của quy trình; danh sách rỗng trả null.
     */
    String select(String processDefinitionId, String taskDefinitionKey, List<String> candidates);
}
