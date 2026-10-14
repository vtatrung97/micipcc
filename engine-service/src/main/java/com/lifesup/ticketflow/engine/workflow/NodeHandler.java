package com.lifesup.ticketflow.engine.workflow;

import com.lifesup.ticketflow.engine.workflow.bpmn.BpmnExtensions;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConversionContext;
import com.lifesup.ticketflow.engine.workflow.bpmn.ConvertedNode;
import com.lifesup.ticketflow.engine.workflow.validation.NodeCheck;
import java.util.EnumSet;
import java.util.Set;
import org.flowable.bpmn.model.Activity;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.ErrorEventDefinition;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.FlowableListener;
import org.flowable.bpmn.model.ImplementationType;
import org.flowable.bpmn.model.SequenceFlow;
import org.flowable.bpmn.model.ServiceTask;

/**
 * Toàn bộ xử lý riêng của một loại node khi thiết kế: cổng ra hợp lệ, kiểm tra cấu hình, sinh BPMN.
 * Phần chạy (listener / delegate) nằm cùng package với handler.
 *
 * <p>Thêm loại node mới: thêm giá trị NodeType, một class cấu hình, một handler (@Component) và bean runtime nếu cần.
 * Không phải sửa lõi workflow.
 *
 * @param <C> class cấu hình của node
 */
public abstract class NodeHandler<C extends NodeConfig> {
    private final Class<C> configType;
    private final Set<NodeType> types;

    protected NodeHandler(Class<C> configType, NodeType type, NodeType... moreTypes) {
        this.configType = configType;
        this.types = EnumSet.of(type, moreTypes);
    }

    public Class<C> configType() {
        return configType;
    }

    public Set<NodeType> types() {
        return types;
    }

    /** Cổng ra (sourceHandle) hợp lệ của node; mặc định chỉ có {@code next}. */
    public boolean isValidHandle(WorkflowNode node, C config, String handle) {
        return SourceHandles.NEXT.equals(handle);
    }

    /** Lượt 1 của kiểm tra: khai báo các biến node ghi ra, để lượt 2 kiểm tra được chỗ đọc biến. */
    public void declareVariables(C config, NodeCheck check) {
    }

    /** Lượt 2 của kiểm tra: cấu hình và các edge đi ra của node. */
    public void validate(C config, NodeCheck check) {
    }

    /** Sinh phần tử BPMN cho node; id lấy từ {@link ConversionContext#bpmnId}. */
    public abstract ConvertedNode toBpmn(WorkflowNode node, C config, ConversionContext context);

    /** Bổ sung cho sequence flow đi ra khỏi node (gateway gắn điều kiện / nhánh mặc định). */
    public void configureOutgoingFlow(SequenceFlow flow, String handle, WorkflowNode node, C config,
            ConversionContext context) {
    }

    // ---- Tiện ích dựng phần tử BPMN cho các handler ----

    /** Gán id, tên, mô tả và ghi cấu hình vào tf:config để bean runtime đọc lại. */
    protected <T extends FlowElement> T init(T element, WorkflowNode node, ConversionContext context) {
        element.setId(context.bpmnId(node.getId()));
        element.setName(node.getName());
        if (node.getDescription() != null && !node.getDescription().isBlank()) {
            element.setDocumentation(node.getDescription());
        }
        BpmnExtensions.put(element, BpmnExtensions.CONFIG, context.toJson(node.getConfig()));
        return element;
    }

    /** Service task gọi bean {@code beanName}. */
    protected static void delegateTo(ServiceTask task, String beanName) {
        task.setImplementationType(ImplementationType.IMPLEMENTATION_TYPE_DELEGATEEXPRESSION);
        task.setImplementation("${" + beanName + "}");
    }

    /** Execution listener gọi bean {@code beanName} tại sự kiện {@code event}. */
    protected static FlowableListener listener(String event, String beanName) {
        FlowableListener listener = new FlowableListener();
        listener.setEvent(event);
        listener.setImplementationType(ImplementationType.IMPLEMENTATION_TYPE_DELEGATEEXPRESSION);
        listener.setImplementation("${" + beanName + "}");
        return listener;
    }

    /** Boundary error (ngắt activity) bắt lỗi BPMN {@code errorCode} ném ra từ activity. */
    protected static BoundaryEvent errorBoundary(Activity activity, String errorCode, ConversionContext context) {
        BoundaryEvent boundary = new BoundaryEvent();
        boundary.setId(context.newId("boundary_error_", activity.getId()));
        boundary.setAttachedToRef(activity);
        boundary.setAttachedToRefId(activity.getId());
        boundary.setCancelActivity(true);
        ErrorEventDefinition error = new ErrorEventDefinition();
        error.setErrorCode(errorCode);
        boundary.addEventDefinition(error);
        activity.getBoundaryEvents().add(boundary);
        return boundary;
    }

    /** Đường dẫn field trong danh sách cho lỗi validate, VD path("config.inputs", 0, "variable"). */
    protected static String path(String list, int index, String field) {
        return list + "[" + index + "]." + field;
    }
}
