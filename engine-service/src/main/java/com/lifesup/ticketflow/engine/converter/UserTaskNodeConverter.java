package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.model.UserTaskNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.util.ArrayList;
import org.flowable.bpmn.model.UserTask;
import org.springframework.stereotype.Component;

/**
 * USER_TASK → user task: formKey = formId, category = departmentId, candidate = nhóm và người xử lý.
 * Người nhận cụ thể và hạn xử lý là biểu thức gọi bean UserTaskAssignment; Flowable tự đánh giá khi tạo task nên
 * lịch sử task và identity link được ghi đúng (gán trong task listener thì lịch sử không cập nhật).
 */
@Component
public final class UserTaskNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.USER_TASK;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        UserTaskNodeConfig config = node.config(UserTaskNodeConfig.class);
        UserTask task = init(new UserTask(), node, context);
        task.setFormKey(config.getFormId());
        task.setCategory(config.getDepartmentId());
        task.setCandidateGroups(new ArrayList<>(config.getGroupIds()));
        task.setCandidateUsers(new ArrayList<>(config.getAgentIds()));
        task.setAssignee(BpmnExpressions.userTaskAssignee());
        task.setDueDate(BpmnExpressions.userTaskDueDate());
        return ConvertedNode.single(task);
    }
}
