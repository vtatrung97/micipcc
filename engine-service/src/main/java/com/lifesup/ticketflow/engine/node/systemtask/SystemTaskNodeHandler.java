package com.lifesup.ticketflow.engine.node.systemtask;

import static com.lifesup.ticketflow.engine.workflow.validation.Identifiers.isBlank;

import com.lifesup.ticketflow.engine.workflow.handler.NodeHandler;
import com.lifesup.ticketflow.engine.workflow.model.NodeType;
import com.lifesup.ticketflow.engine.workflow.model.SourceHandles;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import com.lifesup.ticketflow.engine.workflow.validation.ValidationCode;
import java.util.List;
import java.util.Map;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.ServiceTask;
import org.springframework.stereotype.Component;

/**
 * SYSTEM_TASK → service task bất đồng bộ gọi SystemTaskDelegate; cổng ra {@code success} và {@code error}.
 *
 * <p>Async để lời gọi HTTP không nằm trong transaction / thread của request người dùng; lỗi kỹ thuật được
 * async executor thử lại. Có nhánh error thì gắn boundary error bắt lỗi nghiệp vụ SYSTEM_TASK_ERROR.
 */
@Component
public class SystemTaskNodeHandler extends NodeHandler<SystemTaskNodeConfig> {
    /** Mã lỗi BPMN khi API trả lỗi nghiệp vụ. */
    public static final String ERROR_SYSTEM_TASK = "SYSTEM_TASK_ERROR";

    public SystemTaskNodeHandler() {
        super(SystemTaskNodeConfig.class, NodeType.SYSTEM_TASK);
    }

    @Override
    public boolean isValidHandle(WorkflowNode node, SystemTaskNodeConfig config, String handle) {
        return SourceHandles.SUCCESS.equals(handle) || SourceHandles.ERROR.equals(handle);
    }

    @Override
    public void declareVariables(SystemTaskNodeConfig config, NodeCheck check) {
        List<SystemTaskNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.declare(path("config.outputs", i, "variable"), outputs.get(i).getVariable());
        }
    }

    @Override
    public void validate(SystemTaskNodeConfig config, NodeCheck check) {
        if (!check.hasOutgoing(SourceHandles.SUCCESS)) {
            check.error(ValidationCode.SYSTEM_TASK_SUCCESS_EDGE_REQUIRED, "id", "Gọi API cần nhánh thành công");
        }
        if (isBlank(config.getApiId())) {
            check.error(ValidationCode.SYSTEM_TASK_API_REQUIRED, "config.apiId", "Chưa chọn API");
        }
        if (config.getTimeout() != null && config.getTimeout() <= 0) {
            check.error(ValidationCode.SYSTEM_TASK_TIMEOUT_INVALID, "config.timeout", "Timeout phải lớn hơn 0");
        }
        if (config.getRetry() != null && config.getRetry() < 0) {
            check.error(ValidationCode.SYSTEM_TASK_RETRY_INVALID, "config.retry", "Số lần thử lại không được âm");
        }
        List<SystemTaskNodeConfig.Input> inputs = config.getInputs();
        for (int i = 0; i < inputs.size(); i++) {
            check.requireField(path("config.inputs", i, "apiParam"), inputs.get(i).getApiParam());
            check.requireDeclared(path("config.inputs", i, "variable"), inputs.get(i).getVariable());
        }
        List<SystemTaskNodeConfig.Output> outputs = config.getOutputs();
        for (int i = 0; i < outputs.size(); i++) {
            check.requireField(path("config.outputs", i, "apiField"), outputs.get(i).getApiField());
        }
    }

    @Override
    public ConvertedNode toBpmn(WorkflowNode node, SystemTaskNodeConfig config, ConversionContext context) {
        // Service task gọi SystemTaskDelegate (gọi API qua integration-service, đọc tf:config để map input / output)
        ServiceTask task = init(new ServiceTask(), node, context);
        delegateTo(task, SystemTaskDelegate.BEAN);
        // Chạy trong job nền: gọi API chậm / lỗi không làm treo hay rollback transaction trước đó, job lỗi được thử lại
        task.setAsynchronous(true);

        // Không nối nhánh error: một phần tử, cổng success đi ra từ task
        if (!context.hasOutgoing(node.getId(), SourceHandles.ERROR)) {
            // 1 ConvertedNode, bên trong 1 phần tử
            return ConvertedNode.single(task);
        }

        // Có nhánh error: gắn boundary bắt BPMN error SYSTEM_TASK_ERROR (delegate ném khi API lỗi nghiệp vụ).
        // Edge vào và cổng success dùng task, cổng error đi ra từ boundary
        BoundaryEvent error = errorBoundary(task, ERROR_SYSTEM_TASK, context);
        // 1 ConvertedNode, bên trong 2 phần tử
        return new ConvertedNode(task, task, Map.of(SourceHandles.ERROR, error), List.of(task, error));
    }
}
