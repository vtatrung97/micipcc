package com.lifesup.ticketflow.engine.workflow.bpmn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.workflow.handler.NodeHandlers;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowDefinition;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowEdge;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowNode;
import java.util.HashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.model.BpmnModel;
import org.flowable.bpmn.model.FlowNode;
import org.flowable.bpmn.model.Process;
import org.flowable.bpmn.model.SequenceFlow;
import org.springframework.stereotype.Component;

/**
 * Dựng BpmnModel từ workflow đã validate: node trước (qua handler của từng loại), sequence flow sau.
 * Id process = processKey nên process definition key trùng mã template, quy trình con gọi được theo mã.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BpmnModelBuilder {
    NodeHandlers handlers;
    ObjectMapper objectMapper;

    public BpmnModel build(WorkflowDefinition workflow) {
        BpmnModel model = new BpmnModel();
        model.setTargetNamespace(BpmnExtensions.NAMESPACE);
        model.addNamespace(BpmnExtensions.NAMESPACE_PREFIX, BpmnExtensions.NAMESPACE);

        Process process = new Process();
        process.setId(workflow.getProcessKey());
        process.setName(workflow.getProcessName());
        process.setExecutable(true);
        model.addProcess(process);

        ConversionContext context = new ConversionContext(workflow, objectMapper);
        Map<String, ConvertedNode> converted = new HashMap<>();
        for (WorkflowNode node : workflow.getNodes()) {
            // một node Canvas luôn cho ra đúng một ConvertedNode, dù bên trong nó có bao nhiêu phần tử BPMN.
            ConvertedNode result = handlers.of(node).toBpmn(node, node.getConfig(), context);
            result.getElements().forEach(process::addFlowElement);
            converted.put(node.getId(), result);
        }
        for (WorkflowEdge edge : workflow.getEdges()) {
            WorkflowNode source = context.node(edge.getSourceNodeId());
            FlowNode from = converted.get(edge.getSourceNodeId()).exit(edge.getSourceHandle());
            FlowNode to = converted.get(edge.getTargetNodeId()).getEntry();

            SequenceFlow flow = new SequenceFlow(from.getId(), to.getId());
            flow.setId(context.newId("flow_", edge.getId()));
            ConversionContext.link(flow, from, to);
            process.addFlowElement(flow);
            handlers.of(source).configureOutgoingFlow(flow, edge.getSourceHandle(), source, source.getConfig(), context);
        }
        return model;
    }
}
