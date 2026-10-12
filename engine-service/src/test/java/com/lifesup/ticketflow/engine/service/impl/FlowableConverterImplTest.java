package com.lifesup.ticketflow.engine.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.converter.*;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;
import com.lifesup.ticketflow.engine.exception.WorkflowValidationException;
import com.lifesup.ticketflow.engine.mapper.CanvasWorkflowMapper;
import com.lifesup.ticketflow.engine.parser.JacksonCanvasDocumentParser;
import com.lifesup.ticketflow.engine.validation.FlowableModelValidator;
import com.lifesup.ticketflow.engine.validation.WorkflowValidator;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.*;
import org.flowable.validation.ProcessValidatorFactory;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class FlowableConverterImplTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final FlowableConverterImpl converter = new FlowableConverterImpl(
            new JacksonCanvasDocumentParser(objectMapper),
            new CanvasWorkflowMapper(objectMapper),
            new WorkflowValidator(),
            new NodeConverterRegistry(List.of(new StartNodeConverter(), new UserTaskNodeConverter(),
                    new SystemTaskNodeConverter(), new NotificationNodeConverter(), new SubProcessNodeConverter(),
                    new ExclusiveGatewayNodeConverter(), new ParallelGatewayNodeConverter(),
                    new InclusiveGatewayNodeConverter(), new JoinNodeConverter(), new EndNodeConverter())),
            new FlowableModelValidator());

    @Test
    void convertsSimpleFlowAndIgnoresViewport() {
        ConversionResult result = convert(document(
                nodes(start(), userTask("task", "Review"), end("end")),
                edges(edge("e1", "start", "next", "task"), edge("e2", "task", "next", "end"))));

        assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(StartEvent.class)).hasSize(1);
        assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(UserTask.class)).hasSize(1);
        assertThat(result.getBpmnXml()).contains("userTask").doesNotContain("viewport");
    }

    @Test
    void convertsExclusiveGatewayCaseAndDefaultFlow() {
        String gateway = node("gateway", "GATEWAY_EXCLUSIVE", "decide", "Decision",
                "{\"cases\":[{\"id\":\"case_yes\",\"name\":\"Yes\",\"conditions\":[{\"field\":\"priority\",\"operator\":\"EQ\",\"value\":\"HIGH\"}]}],\"joinNodeId\":\"join\"}");
        String join = node("join", "JOIN", "join", "Join", "{\"gatewayNodeId\":\"gateway\"}");
        ConversionResult result = convert(document(
                nodes(start(), gateway, userTask("task", "Review"), join, end("end")),
                edges(edge("e1", "start", "next", "gateway"), edge("e2", "gateway", "case_yes", "task"),
                        edge("e3", "gateway", "default", "join"), edge("e4", "task", "next", "join"),
                        edge("e5", "join", "next", "end"))));

        ExclusiveGateway split = result.getBpmnModel().getMainProcess()
                .findFlowElementsOfType(ExclusiveGateway.class).stream()
                .filter(item -> "Decision".equals(item.getName())).findFirst().orElseThrow();
        assertThat(split.getDefaultFlow()).isNotBlank();
        assertThat(split.getOutgoingFlows()).extracting(SequenceFlow::getConditionExpression)
                .contains("${workflowConditionEvaluator.matches(execution, 'decide', 'case_yes')}");
    }

    @Test
    void mapsParallelAndInclusiveJoinToMatchingGatewayType() {
        String parallel = node("parallel", "GATEWAY_PARALLEL", "parallel", "Parallel",
                "{\"cases\":[{\"id\":\"p1\",\"conditions\":[]}],\"joinNodeId\":\"pjoin\"}");
        String pjoin = node("pjoin", "JOIN", "pjoin", "Parallel join", "{\"gatewayNodeId\":\"parallel\"}");
        ConversionResult result = convert(document(nodes(start(), parallel, pjoin, end("end")),
                edges(edge("e1", "start", "next", "parallel"), edge("e2", "parallel", "p1", "pjoin"),
                        edge("e3", "pjoin", "next", "end"))));

        assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(ParallelGateway.class)).hasSize(2);
    }

    @Test
    void mapsSystemTaskErrorToBoundaryErrorEvent() {
        String system = node("system", "SYSTEM_TASK", "send_sms", "Send SMS",
                "{\"systemId\":\"SMS_GW\",\"apiId\":\"sms.send\",\"timeout\":30,\"retry\":3}");
        ConversionResult result = convert(document(nodes(start(), system, end("done"), end("failed")),
                edges(edge("e1", "start", "next", "system"), edge("e2", "system", "success", "done"),
                        edge("e3", "system", "error", "failed"))));

        BoundaryEvent boundary = result.getBpmnModel().getMainProcess().findFlowElementsOfType(BoundaryEvent.class).get(0);
        assertThat(boundary.getAttachedToRefId()).startsWith("node_system");
        assertThat(((ErrorEventDefinition) boundary.getEventDefinitions().get(0)).getErrorCode())
                .isEqualTo("SYSTEM_TASK_ERROR");
    }

    @Test
    void mapsUserAssignmentNotificationAndSubProcess() {
        String user = node("user", "USER_TASK", "assign", "Assign",
                "{\"groupId\":\"GROUP_A\",\"agentId\":\"agent_1\"}");
        String notification = node("notification", "NOTIFICATION", "notify", "Notify",
                "{\"recipientIds\":[\"GROUP_A\"],\"content\":\"Done\",\"channels\":[\"EMAIL\"]}");
        String subprocess = node("sub", "SUB_PROCESS", "sub", "Sub process",
                "{\"subProcessId\":\"702305427898417999\",\"inputMapping\":[],\"outputMapping\":[]}");
        ConversionResult result = convert(document(nodes(start(), user, notification, subprocess, end("end")),
                edges(edge("e1", "start", "next", "user"), edge("e2", "user", "next", "notification"),
                        edge("e3", "notification", "next", "sub"), edge("e4", "sub", "next", "end"))));

        UserTask task = result.getBpmnModel().getMainProcess().findFlowElementsOfType(UserTask.class).get(0);
        assertThat(task.getAssignee()).isEqualTo("agent_1");
        assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(ServiceTask.class))
                .extracting(ServiceTask::getImplementation).contains("${notificationTaskDelegate}");
        assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(CallActivity.class).get(0).getCalledElement())
                .contains("subProcessResolver.resolve");
    }

    @Test
    void generatedXmlCanBeReadBackAndPassesFlowableValidation() {
        ConversionResult result = convert(document(nodes(start(), end("end")),
                edges(edge("e1", "start", "next", "end"))));
        byte[] xml = result.getBpmnXml().getBytes(StandardCharsets.UTF_8);
        BpmnModel read = new BpmnXMLConverter().convertToBpmnModel(() -> new ByteArrayInputStream(xml), true, true);

        assertThat(read.getMainProcess()).isNotNull();
        assertThat(new ProcessValidatorFactory().createDefaultProcessValidator().validate(result.getBpmnModel()))
                .allMatch(error -> error.isWarning());
    }

    @Test
    void convertsTheExactSamplePayloadProvidedByFrontend() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        try (var input = new ClassPathResource("samples/flow-sample.json").getInputStream()) {
            var payload = objectMapper.readTree(input);
            ConversionResult result = convert(payload.get("flowJson").toString());

            assertThat(result.getBpmnModel().getMainProcess().getFlowElements()).isNotEmpty();
            assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(InclusiveGateway.class)).hasSize(2);
            assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(BoundaryEvent.class)).hasSize(1);
            assertThat(result.getBpmnModel().getMainProcess().findFlowElementsOfType(CallActivity.class)).hasSize(1);
        }
    }

    @Test
    void rejectsOldCellsSchema() {
        assertCode("{\"cells\":[]}", "CANVAS_JSON_INVALID");
    }

    @Test
    void rejectsUnsupportedTypeAndInvalidHandle() {
        assertCode(document(nodes(start(), node("x", "SCRIPT", "x", "X", "{}"), end("end")), edges()),
                "NODE_TYPE_UNSUPPORTED");
        assertCode(document(nodes(start(), end("end")), edges(edge("e1", "start", "error", "end"))),
                "INVALID_SOURCE_HANDLE");
    }

    @Test
    void rejectsGatewayWithoutMatchingJoin() {
        String gateway = node("gateway", "GATEWAY_EXCLUSIVE", "gateway", "Gateway",
                "{\"cases\":[],\"joinNodeId\":\"missing\"}");
        assertCode(document(nodes(start(), gateway, end("end")),
                edges(edge("e1", "start", "next", "gateway"), edge("e2", "gateway", "default", "end"))),
                "GATEWAY_JOIN_NOT_FOUND");
    }

    private ConversionResult convert(String modelJson) {
        return converter.convert(new ConversionCommand("ticket-process", "Ticket process", modelJson));
    }

    private void assertCode(String json, String code) {
        assertThatThrownBy(() -> convert(json)).isInstanceOf(WorkflowValidationException.class)
                .satisfies(error -> assertThat(((WorkflowValidationException) error).getErrors())
                        .extracting(item -> item.getCode()).contains(code));
    }

    private static String document(String nodes, String edges) {
        return "{\"nodes\":" + nodes + ",\"edges\":" + edges
                + ",\"viewport\":{\"zoom\":1.2,\"x\":0,\"y\":0}}";
    }

    private static String nodes(String... nodes) { return "[" + String.join(",", nodes) + "]"; }
    private static String edges(String... edges) { return "[" + String.join(",", edges) + "]"; }

    private static String start() { return node("start", "START", "start", "", "{}"); }
    private static String end(String id) { return node(id, "END", id, "", "{}"); }
    private static String userTask(String id, String name) { return node(id, "USER_TASK", id, name, "{}"); }

    private static String node(String id, String type, String key, String name, String config) {
        return "{\"id\":\"" + id + "\",\"type\":\"" + type + "\",\"name\":\"" + name
                + "\",\"key\":\"" + key + "\",\"description\":\"\",\"position\":{\"x\":0,\"y\":0},\"config\":" + config + "}";
    }

    private static String edge(String id, String source, String handle, String target) {
        return "{\"id\":\"" + id + "\",\"source\":\"" + source + "\",\"sourceHandle\":\""
                + handle + "\",\"target\":\"" + target + "\"}";
    }
}
