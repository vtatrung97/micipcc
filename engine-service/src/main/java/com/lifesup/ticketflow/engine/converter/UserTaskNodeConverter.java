package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.UserTask;
import org.springframework.stereotype.Component;

/** Chuyển userTask thành Flowable user task. */
@Component
public final class UserTaskNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.USER_TASK; }
    @Override
    public FlowElement convert(WorkflowNode node) {
        UserTask task = named(new UserTask(), node);
        String agentId = stringConfig(node, "agentId");
        String groupId = stringConfig(node, "groupId");
        if (agentId != null) task.setAssignee(agentId);
        else if (groupId != null) task.setCandidateGroups(java.util.List.of(groupId));
        return task;
    }

    private static String stringConfig(WorkflowNode node, String key) {
        Object value = node.getConfig().get(key);
        return value instanceof String text && !text.isBlank() ? text : null;
    }
}
