package com.lifesup.ticketflow.engine.service.impl;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.converter.NodeConverterRegistry;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;
import com.lifesup.ticketflow.engine.dto.workflow.*;
import com.lifesup.ticketflow.engine.mapper.CanvasWorkflowMapper;
import com.lifesup.ticketflow.engine.parser.CanvasDocumentParser;
import com.lifesup.ticketflow.engine.service.FlowableConverterService;
import com.lifesup.ticketflow.engine.utils.BpmnIdNormalizer;
import com.lifesup.ticketflow.engine.validation.FlowableModelValidator;
import com.lifesup.ticketflow.engine.validation.WorkflowValidator;
import java.nio.charset.StandardCharsets;
import java.util.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.*;
import org.springframework.stereotype.Service;

/** Orchestrator của luồng Canvas JSON sang Flowable BPMN. */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public final class FlowableConverterImpl implements FlowableConverterService {
    static final String SYSTEM_TASK_ERROR_CODE = "SYSTEM_TASK_ERROR";
    CanvasDocumentParser parser;
    CanvasWorkflowMapper mapper;
    WorkflowValidator workflowValidator;
    NodeConverterRegistry nodeConverters;
    FlowableModelValidator flowableValidator;

    /** Parse, validate, dựng BPMN model rồi sinh XML trong memory. */
    @Override
    public ConversionResult convert(ConversionCommand command) {
        if (command == null) throw new IllegalArgumentException("command is required");

        CanvasDocument document = parser.parse(command.getModelJson());
        workflowValidator.validateDocument(document);

        WorkflowDefinition workflow = mapper.map(document, command.getProcessKey(), command.getProcessName());
        workflowValidator.validate(workflow);

        BpmnModel model = toBpmnModel(workflow);
        flowableValidator.validate(model);

        String xml = new String(new BpmnXMLConverter().convertToXML(model), StandardCharsets.UTF_8);
        return new ConversionResult(model, xml);
    }

    /** Tạo process, node trước và sequence flow sau. */
    private BpmnModel toBpmnModel(WorkflowDefinition workflow) {
        BpmnIdNormalizer ids = new BpmnIdNormalizer();
        Map<String, String> nodeIds = new LinkedHashMap<>();
        Map<String, FlowNode> flowNodes = new LinkedHashMap<>();
        Map<String, WorkflowNode> workflowNodes = new LinkedHashMap<>();
        BpmnModel model = new BpmnModel();
        model.setTargetNamespace("https://lifesup.com/ticket-flow");
        org.flowable.bpmn.model.Process process = createProcess(workflow, ids);
        model.addProcess(process);

        for (WorkflowNode node : workflow.getNodes()) {
            String bpmnId = ids.normalize("node_", node.getId());
            FlowElement element = nodeConverters.get(node.getType()).convert(node);
            element.setId(bpmnId);
            process.addFlowElement(element);
            nodeIds.put(node.getId(), bpmnId);
            flowNodes.put(node.getId(), (FlowNode) element);
            workflowNodes.put(node.getId(), node);
        }
        for (WorkflowEdge edge : workflow.getEdges()) {
            addSequenceFlow(process, edge, workflowNodes, nodeIds, flowNodes, ids);
        }
        return model;
    }

    private static org.flowable.bpmn.model.Process createProcess(
            WorkflowDefinition workflow, BpmnIdNormalizer ids) {
        org.flowable.bpmn.model.Process process = new org.flowable.bpmn.model.Process();
        process.setId(ids.normalize("process_", workflow.getProcessKey()));
        process.setName(workflow.getProcessName());
        process.setExecutable(true);
        return process;
    }

    /** Tạo flow thường, gateway condition/default hoặc system-task boundary error. */
    private static void addSequenceFlow(org.flowable.bpmn.model.Process process,
            WorkflowEdge transition, Map<String, WorkflowNode> workflowNodes,
            Map<String, String> nodeIds, Map<String, FlowNode> flowNodes, BpmnIdNormalizer ids) {
        WorkflowNode sourceNode = workflowNodes.get(transition.getSourceNodeId());
        FlowNode source = flowNodes.get(transition.getSourceNodeId());
        FlowNode target = flowNodes.get(transition.getTargetNodeId());
        if (sourceNode.getType() == NodeType.SYSTEM_TASK && "error".equals(transition.getSourceHandle())) {
            source = addSystemTaskBoundaryError(process, (Activity) source, transition, ids);
        }

        SequenceFlow flow = new SequenceFlow(source.getId(), nodeIds.get(transition.getTargetNodeId()));
        flow.setId(ids.normalize("flow_", transition.getId()));
        applyGatewaySemantics(flow, sourceNode, transition);
        flow.setSourceFlowElement(source);
        flow.setTargetFlowElement(target);
        process.addFlowElement(flow);
        source.getOutgoingFlows().add(flow);
        target.getIncomingFlows().add(flow);

        if ("default".equals(transition.getSourceHandle()) && source instanceof Gateway gateway)
            gateway.setDefaultFlow(flow.getId());
    }

    /** Sinh boundary error event cho nhánh error của SYSTEM_TASK. */
    private static BoundaryEvent addSystemTaskBoundaryError(org.flowable.bpmn.model.Process process,
            Activity task, WorkflowEdge transition, BpmnIdNormalizer ids) {
        BoundaryEvent boundary = new BoundaryEvent();
        boundary.setId(ids.normalize("boundary_error_", transition.getSourceNodeId()));
        boundary.setAttachedToRef(task);
        boundary.setAttachedToRefId(task.getId());
        boundary.setCancelActivity(true);
        ErrorEventDefinition error = new ErrorEventDefinition();
        error.setErrorCode(SYSTEM_TASK_ERROR_CODE);
        boundary.addEventDefinition(error);
        process.addFlowElement(boundary);
        return boundary;
    }

    /** Gắn tên và fixed condition expression cho gateway case. */
    private static void applyGatewaySemantics(SequenceFlow flow, WorkflowNode source,
            WorkflowEdge transition) {
        if (!isGateway(source.getType()) || "default".equals(transition.getSourceHandle())) return;
        Map<String, Object> gatewayCase = findCase(source, transition.getSourceHandle());
        Object name = gatewayCase.get("name");
        if (name instanceof String text) flow.setName(text);
        if (source.getType() != NodeType.GATEWAY_PARALLEL) {
            flow.setConditionExpression("${workflowConditionEvaluator.matches(execution, '"
                    + source.getKey() + "', '" + transition.getSourceHandle() + "')}");
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> findCase(WorkflowNode gateway, String caseId) {
        Object value = gateway.getConfig().get("cases");
        if (!(value instanceof List<?> cases)) return Map.of();
        return cases.stream().filter(Map.class::isInstance).map(item -> (Map<String, Object>) item)
                .filter(item -> caseId.equals(item.get("id"))).findFirst().orElse(Map.of());
    }

    private static boolean isGateway(NodeType type) {
        return type == NodeType.GATEWAY_EXCLUSIVE || type == NodeType.GATEWAY_PARALLEL
                || type == NodeType.GATEWAY_INCLUSIVE;
    }

}
