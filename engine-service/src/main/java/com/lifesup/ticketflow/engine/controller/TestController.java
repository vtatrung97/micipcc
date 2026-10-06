package com.lifesup.ticketflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;
import com.lifesup.ticketflow.engine.dto.flowable.SampleFlowPayload;
import com.lifesup.ticketflow.engine.dto.flowable.TestDeploymentResponse;
import com.lifesup.ticketflow.engine.service.FlowableConverterService;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.flowable.engine.repository.ProcessDefinition;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Endpoint tạm để convert và deploy flow mẫu vào Flowable. */
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestController {
    static final String SAMPLE_FILE = "samples/flow-sample.json";
    static final String SAMPLE_PROCESS_KEY = "test_multi_department_complaint";

    ObjectMapper objectMapper;
    FlowableConverterService flowableConverterService;
    RepositoryService repositoryService;

    /** Đọc JSON mẫu, convert sang BPMN và tạo một deployment mới. */
    @PostMapping("/save")
    public TestDeploymentResponse save() {
        SampleFlowPayload payload = readSample();
        ConversionResult result = flowableConverterService.convert(new ConversionCommand(
                SAMPLE_PROCESS_KEY, payload.getName(), payload.getFlowJson().toString()));

        String resourceName = SAMPLE_PROCESS_KEY + ".bpmn20.xml";
        Deployment deployment = repositoryService.createDeployment()
                .name(payload.getVersionName())
                .addBytes(resourceName, result.getBpmnXml().getBytes(StandardCharsets.UTF_8))
                .deploy();
        ProcessDefinition definition = repositoryService.createProcessDefinitionQuery()
                .deploymentId(deployment.getId())
                .singleResult();
        if (definition == null)
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Flowable deployment did not create a process definition");

        return new TestDeploymentResponse(deployment.getId(), deployment.getName(), definition.getId(),
                definition.getKey(), definition.getVersion(), resourceName, result.getBpmnXml());
    }

    /** Đọc nguyên payload FE từ classpath để endpoint không phụ thuộc filesystem máy chạy. */
    private SampleFlowPayload readSample() {
        try (var input = new ClassPathResource(SAMPLE_FILE).getInputStream()) {
            SampleFlowPayload payload = objectMapper.readValue(input, SampleFlowPayload.class);
            if (payload.getFlowJson() == null || !payload.getFlowJson().isObject())
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Sample flowJson must be a JSON object");
            return payload;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot read sample flow JSON", exception);
        }
    }
}
