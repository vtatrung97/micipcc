package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.SequenceFlow;

/** Chiến lược chuyển một loại node thành phần tử BPMN. */
public interface NodeConverter {

    NodeType supports();

    /** Sinh phần tử BPMN cho node, id lấy từ {@link ConversionContext#bpmnId}. */
    ConvertedNode convert(WorkflowNode node, ConversionContext context);

    /**
     * Bổ sung ngữ nghĩa cho sequence flow đi ra khỏi node (gateway gắn điều kiện / nhánh mặc định).
     * Được gọi sau khi flow đã nối hai đầu.
     */
    default void configureOutgoingFlow(SequenceFlow flow, WorkflowEdge edge, WorkflowNode node,
            ConversionContext context) {
        // Mặc định không cần bổ sung
    }
}
