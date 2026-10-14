package com.lifesup.ticketflow.engine.converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
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
 * Dựng BpmnModel từ workflow đã validate: node trước (qua converter của từng loại), sequence flow sau.
 * Id process = processKey nên process definition key trùng mã template, quy trình con gọi được theo mã.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BpmnModelBuilder {
    static final String TARGET_NAMESPACE = "https://lifesup.com/ticket-flow";

    NodeConverterRegistry converters;
    ObjectMapper objectMapper;

    public BpmnModel build(WorkflowDefinition workflow) {
        BpmnModel model = new BpmnModel();
        model.setTargetNamespace(TARGET_NAMESPACE);
        model.addNamespace(BpmnConstants.NAMESPACE_PREFIX, BpmnConstants.NAMESPACE);

        Process process = new Process();
        process.setId(workflow.getProcessKey());
        process.setName(workflow.getProcessName());
        process.setExecutable(true);
        model.addProcess(process);

        ConversionContext context = new ConversionContext(workflow, objectMapper);
        Map<String, ConvertedNode> converted = new HashMap<>();
        for (WorkflowNode node : workflow.getNodes()) {
            ConvertedNode result = converters.get(node.getType()).convert(node, context);
            result.elements().forEach(process::addFlowElement);
            converted.put(node.getId(), result);
        }
        for (WorkflowEdge edge : workflow.getEdges()) {
            WorkflowNode source = context.node(edge.getSourceNodeId());
            FlowNode from = converted.get(edge.getSourceNodeId()).exit(edge.getSourceHandle());
            FlowNode to = converted.get(edge.getTargetNodeId()).entry();

            SequenceFlow flow = new SequenceFlow(from.getId(), to.getId());
            flow.setId(context.newId("flow_", edge.getId()));
            ConversionContext.link(flow, from, to);
            process.addFlowElement(flow);
            converters.get(source.getType()).configureOutgoingFlow(flow, edge, source, context);
        }
        return model;
    }
}
