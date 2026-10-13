package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.common.constants.WorkflowVariables;
import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessNodeConfig;
import com.lifesup.ticketflow.engine.dto.canvas.model.SubProcessOutputMapping;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.CallActivity;
import org.flowable.bpmn.model.IOParameter;
import org.springframework.stereotype.Component;

/**
 * SUB_PROCESS → call activity gọi process key = subProcessId (mã template của quy trình con).
 * Flowable lấy phiên bản deploy mới nhất của quy trình con tại thời điểm gọi.
 *
 * <ul>
 *   <li>Vào: một tham số {@code __input} = map {subField: giá trị biến} (START của quy trình con map tiếp).</li>
 *   <li>Ra: mỗi output đọc {@code __output[subField]} của quy trình con ghi vào biến của quy trình cha.</li>
 * </ul>
 */
@Component
public final class SubProcessNodeConverter extends AbstractNodeConverter {

    @Override
    public NodeType supports() {
        return NodeType.SUB_PROCESS;
    }

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        SubProcessNodeConfig config = node.config(SubProcessNodeConfig.class);
        CallActivity activity = init(new CallActivity(), node, context);
        activity.setCalledElement(config.getSubProcessId());
        activity.setInheritBusinessKey(true);

        IOParameter input = new IOParameter();
        input.setSourceExpression(BpmnExpressions.subProcessInput(activity.getId()));
        input.setTarget(WorkflowVariables.INPUT);
        activity.getInParameters().add(input);

        for (SubProcessOutputMapping mapping : config.getOutputs()) {
            IOParameter output = new IOParameter();
            output.setSourceExpression(BpmnExpressions.subProcessOutput(mapping.getSubField()));
            output.setTarget(mapping.getVariable());
            activity.getOutParameters().add(output);
        }
        return ConvertedNode.single(activity);
    }
}
