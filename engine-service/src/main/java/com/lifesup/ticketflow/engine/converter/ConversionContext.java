package com.lifesup.ticketflow.engine.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.dto.canvas.model.NodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import com.lifesup.ticketflow.engine.utils.BpmnIdNormalizer;
import java.util.HashMap;
import java.util.Map;
import org.flowable.bpmn.model.FlowNode;
import org.flowable.bpmn.model.SequenceFlow;

/**
 * Dữ liệu dùng chung khi chuyển một quy trình: id BPMN đã gán cho từng node (gán trước khi convert để converter
 * tham chiếu được node khác), tra cứu node / edge và tạo sequence flow nội bộ.
 */
public final class ConversionContext {
    private final WorkflowDefinition workflow;
    private final ObjectMapper objectMapper;
    private final BpmnIdNormalizer ids = new BpmnIdNormalizer();
    private final Map<String, String> bpmnIds = new HashMap<>();

    public ConversionContext(WorkflowDefinition workflow, ObjectMapper objectMapper) {
        this.workflow = workflow;
        this.objectMapper = objectMapper;
        workflow.getNodes().forEach(node -> bpmnIds.put(node.getId(), ids.normalize("node_", node.getId())));
    }

    /** Id BPMN của node Canvas. */
    public String bpmnId(String nodeId) {
        String bpmnId = bpmnIds.get(nodeId);
        if (bpmnId == null) {
            throw new IllegalStateException("Unknown node id: " + nodeId);
        }
        return bpmnId;
    }

    public WorkflowNode node(String nodeId) {
        return workflow.findNode(nodeId).orElseThrow(() -> new IllegalStateException("Unknown node id: " + nodeId));
    }

    /** Node có edge đi ra từ cổng {@code sourceHandle} không. */
    public boolean hasOutgoing(String nodeId, String sourceHandle) {
        return workflow.outgoing(nodeId).stream().anyMatch(edge -> sourceHandle.equals(edge.getSourceHandle()));
    }

    /** Id duy nhất cho phần tử BPMN do engine tự sinh (sequence flow nội bộ, boundary event...). */
    public String newId(String prefix, String original) {
        return ids.normalize(prefix, original);
    }

    /** Nối hai phần tử nội bộ của cùng một node (VD task đánh giá điều kiện → gateway). */
    public SequenceFlow connect(FlowNode source, FlowNode target) {
        SequenceFlow flow = new SequenceFlow(source.getId(), target.getId());
        flow.setId(newId("flow_", source.getId() + "_" + target.getId()));
        link(flow, source, target);
        return flow;
    }

    /** Gắn hai đầu của sequence flow vào phần tử nguồn / đích. */
    public static void link(SequenceFlow flow, FlowNode source, FlowNode target) {
        flow.setSourceFlowElement(source);
        flow.setTargetFlowElement(target);
        source.getOutgoingFlows().add(flow);
        target.getIncomingFlows().add(flow);
    }

    /**
     * Cấu hình node dạng JSON để ghi vào tf:config. Flowable ghi phần mở rộng trong CDATA nên không được chứa chuỗi
     * "]]&gt;" (chỉ có thể xuất hiện trong giá trị chuỗi người dùng nhập): ký tự "&gt;" ở đó được viết dạng escape unicode
     * của JSON, nội dung JSON không đổi.
     */
    public String toJson(NodeConfig config) {
        try {
            return objectMapper.writeValueAsString(config).replace("]]>", "]]\\u003e");
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Cannot serialize node config", exception);
        }
    }
}
