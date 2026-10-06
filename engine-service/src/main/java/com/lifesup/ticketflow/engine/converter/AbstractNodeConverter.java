package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import org.flowable.bpmn.model.FlowElement;

abstract class AbstractNodeConverter implements NodeConverter {
    protected <T extends FlowElement> T named(T element, WorkflowNode node) {
        element.setName(node.getName());
        if (node.getDescription() != null && !node.getDescription().isBlank())
            element.setDocumentation(node.getDescription());
        return element;
    }
}
