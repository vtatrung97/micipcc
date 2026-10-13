package com.lifesup.ticketflow.engine.node.usertask;

import com.lifesup.ticketflow.engine.node.usertask.UserTaskNodeConfig.AssignType;
import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.util.ArrayList;
import java.util.List;
import org.flowable.bpmn.model.UserTask;
import org.springframework.stereotype.Component;

/**
 * USER_TASK → user task: formKey = formId, category = departmentId, candidate = nhóm và người xử lý.
 * Người nhận và hạn xử lý là biểu thức gọi bean UserTaskAssignment; Flowable tự đánh giá khi tạo task nên lịch sử
 * task và identity link được ghi đúng (gán trong task listener thì lịch sử không cập nhật).
 */
@Component
public class UserTaskNodeHandler extends NodeHandler<UserTaskNodeConfig> {

    public UserTaskNodeHandler() {
        super(UserTaskNodeConfig.class, NodeType.USER_TASK);
    }

    @Override
    public void declareVariables(UserTaskNodeConfig config, NodeCheck check) {
        List<UserTaskNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.declare(path("config.outputs", i, "variable"), outputs.get(i).getVariable());
        }
    }

    @Override
    public void validate(UserTaskNodeConfig config, NodeCheck check) {
        validateAssignment(config, check);
        boolean hasSla = config.getSlaValue() != null || config.getSlaUnit() != null;
        if (hasSla && (config.getSlaValue() == null || config.getSlaValue() <= 0 || config.getSlaUnit() == null)) {
            check.error(ValidationCode.SLA_INVALID, "config.slaValue", "Thời hạn xử lý cần số dương và đơn vị");
        }

        List<UserTaskNodeConfig.Input> inputs = config.getInputs();
        for (int i = 0; i < inputs.size(); i++) {
            check.requireDeclared(path("config.inputs", i, "variable"), inputs.get(i).getVariable());
            check.requireField(path("config.inputs", i, "formField"), inputs.get(i).getFormField());
        }
        List<UserTaskNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.requireField(path("config.outputs", i, "formField"), outputs.get(i).getFormField());
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, UserTaskNodeConfig config, ConversionContext context) {
        UserTask task = init(new UserTask(), node, context);
        task.setFormKey(config.getFormId());
        task.setCategory(config.getDepartmentId());
        task.setCandidateGroups(new ArrayList<>(config.getGroupIds()));
        task.setCandidateUsers(new ArrayList<>(config.getAgentIds()));
        task.setAssignee("${" + UserTaskAssignment.BEAN + ".assignee(execution)}");
        task.setDueDate("${" + UserTaskAssignment.BEAN + ".dueDate(execution)}");
        return ConvertedNode.single(task);
    }

    private static void validateAssignment(UserTaskNodeConfig config, NodeCheck check) {
        if (config.getAssignType() == null) {
            check.error(ValidationCode.USER_TASK_ASSIGN_TYPE_REQUIRED, "config.assignType", "Thiếu cách giao việc");
        } else if (config.getAssignType() == AssignType.MANUAL
                && config.getGroupIds().isEmpty() && config.getAgentIds().isEmpty()) {
            check.error(ValidationCode.USER_TASK_ASSIGNEE_REQUIRED, "config.agentIds",
                    "Cần chọn ít nhất một nhóm hoặc người xử lý");
        } else if (config.getAssignType() == AssignType.AUTO) {
            if (config.getAssignStrategy() == null) {
                check.error(ValidationCode.USER_TASK_ASSIGN_STRATEGY_REQUIRED, "config.assignStrategy",
                        "Giao tự động cần chọn chiến lược");
            }
            if (config.getAgentIds().isEmpty()) {
                check.error(ValidationCode.USER_TASK_AGENT_REQUIRED, "config.agentIds",
                        "Giao tự động cần danh sách người xử lý");
            }
        }
    }
}
