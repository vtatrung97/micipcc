package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;

/** Strategy chuyển một canonical node thành Flowable element. */
public interface NodeConverter {
    /** Loại node mà strategy hỗ trợ. */
    NodeType supports();
    /** Chuyển node sang Flowable element chưa gán BPMN id. */
    FlowElement convert(WorkflowNode node);
}
