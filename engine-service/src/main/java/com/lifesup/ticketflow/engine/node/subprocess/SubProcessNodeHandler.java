package com.lifesup.ticketflow.engine.node.subprocess;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.NodeType;
import com.lifesup.ticketflow.engine.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.WorkflowVariables;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.Identifiers;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.util.List;
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
public class SubProcessNodeHandler extends NodeHandler<SubProcessNodeConfig> {

    public SubProcessNodeHandler() {
        super(SubProcessNodeConfig.class, NodeType.SUB_PROCESS);
    }

    @Override
    public void declareVariables(SubProcessNodeConfig config, NodeCheck check) {
        List<SubProcessNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.declare(path("config.outputs", i, "variable"), outputs.get(i).getVariable());
        }
    }

    @Override
    public void validate(SubProcessNodeConfig config, NodeCheck check) {
        String subProcessId = config.getSubProcessId();
        if (isBlank(subProcessId)) {
            check.error(ValidationCode.SUB_PROCESS_REF_REQUIRED, "config.subProcessId", "Chưa chọn quy trình con");
        } else if (!Identifiers.isProcessKey(subProcessId)) {
            check.error(ValidationCode.SUB_PROCESS_REF_INVALID, "config.subProcessId", "Mã quy trình con không hợp lệ");
        } else if (subProcessId.equals(check.processKey())) {
            check.error(ValidationCode.SUB_PROCESS_SELF_REFERENCE, "config.subProcessId",
                    "Quy trình không được gọi chính nó");
        }
        // subField được chèn vào biểu thức của tham số in / out nên phải là ký tự an toàn
        List<SubProcessNodeConfig.Input> inputs = config.getInputs();
        for (int i = 0; i < inputs.size(); i++) {
            check.requireFieldKey(path("config.inputs", i, "subField"), inputs.get(i).getSubField());
            check.requireDeclared(path("config.inputs", i, "variable"), inputs.get(i).getVariable());
        }
        List<SubProcessNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.requireFieldKey(path("config.outputs", i, "subField"), outputs.get(i).getSubField());
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, SubProcessNodeConfig config, ConversionContext context) {
        CallActivity activity = init(new CallActivity(), node, context);
        activity.setCalledElement(config.getSubProcessId());
        activity.setInheritBusinessKey(true);

        // Đánh giá trên execution của quy trình cha
        activity.getInParameters().add(parameter(
                "${" + SubProcessIo.BEAN + ".input(execution, '" + activity.getId() + "')}", WorkflowVariables.INPUT));
        // Đánh giá trên execution của quy trình con khi kết thúc
        for (SubProcessNodeConfig.Output output : config.getOutputs()) {
            activity.getOutParameters().add(parameter(
                    "${" + SubProcessIo.BEAN + ".output(execution, '" + output.getSubField() + "')}",
                    output.getVariable()));
        }
        return ConvertedNode.single(activity);
    }

    private static IOParameter parameter(String sourceExpression, String target) {
        IOParameter parameter = new IOParameter();
        parameter.setSourceExpression(sourceExpression);
        parameter.setTarget(target);
        return parameter;
    }
}
