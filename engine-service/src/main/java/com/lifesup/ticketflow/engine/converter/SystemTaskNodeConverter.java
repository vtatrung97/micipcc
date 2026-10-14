package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.SourceHandles;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.util.List;
import java.util.Map;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/**
 * SYSTEM_TASK → service task bất đồng bộ gọi SystemTaskDelegate.
 *
 * <p>Async để lời gọi HTTP không nằm trong transaction / thread của request người dùng; lỗi kỹ thuật được
 * async executor thử lại. Có nhánh error thì gắn boundary error bắt lỗi nghiệp vụ SYSTEM_TASK_ERROR.
 */
@Component
public final class SystemTaskNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.SYSTEM_TASK;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        ServiceTask task = init(new ServiceTask(), node, context);
        delegateTo(task, BpmnExpressions.BEAN_SYSTEM_TASK_DELEGATE);
        task.setAsynchronous(true);
        if (!context.hasOutgoing(node.getId(), SourceHandles.ERROR)) {
            return ConvertedNode.single(task);
        }
        BoundaryEvent error = errorBoundary(task, BpmnConstants.ERROR_SYSTEM_TASK, context);
        return new ConvertedNode(task, task, Map.of(SourceHandles.ERROR, error), List.of(task, error));
    }
}
