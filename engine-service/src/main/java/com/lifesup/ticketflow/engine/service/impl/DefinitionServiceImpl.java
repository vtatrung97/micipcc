package com.lifesup.ticketflow.engine.service.impl;

import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.engine.exception.EngineErrorCode;
import com.lifesup.ticketflow.engine.dto.request.DeployDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.request.ValidateDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.response.DeploymentResponse;
import com.lifesup.ticketflow.engine.dto.response.ValidationResultResponse;
import com.lifesup.ticketflow.engine.service.DefinitionService;
import com.lifesup.ticketflow.engine.workflow.WorkflowConverter;
import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidationException;
import java.nio.charset.StandardCharsets;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.flowable.common.engine.api.FlowableException;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.flowable.engine.repository.DeploymentBuilder;
import org.flowable.engine.repository.ProcessDefinition;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Deploy quy trình lên Flowable. Mỗi lần publish là một deployment mới, tên deployment = process key; bật lọc trùng
 * nên core gọi lại cùng nội dung (VD retry) không sinh thêm phiên bản process definition.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DefinitionServiceImpl implements DefinitionService {
    WorkflowConverter converter;
    RepositoryService repositoryService;

    @Override
    public ValidationResultResponse validate(ValidateDefinitionRequest request) {
        try {
            converter.convert(request.getProcessKey(), request.getProcessName(), request.getFlowJson());
            return ValidationResultResponse.ok();
        } catch (WorkflowValidationException exception) {
            return ValidationResultResponse.invalid(exception.getErrors());
        }
    }

    @Override
    public DeploymentResponse deploy(DeployDefinitionRequest request) {
        WorkflowConverter.Result result = converter.convert(request.getProcessKey(), request.getProcessName(),
                request.getFlowJson());

        DeploymentBuilder builder = repositoryService.createDeployment()
                .name(request.getProcessKey())
                .key(request.getProcessKey())
                .addBytes(request.getProcessKey() + ".bpmn20.xml", result.getXml().getBytes(StandardCharsets.UTF_8))
                .enableDuplicateFiltering();
        if (request.getVersionNo() != null) {
            builder.category("v" + request.getVersionNo());
        }
        if (StringUtils.hasText(request.getTenantId())) {
            builder.tenantId(request.getTenantId());
        }

        Deployment deployment;
        try {
            deployment = builder.deploy();
        } catch (FlowableException exception) {
            throw new AppException(EngineErrorCode.DEPLOYMENT_FAILED, exception);
        }
        ProcessDefinition definition = repositoryService.createProcessDefinitionQuery()
                .deploymentId(deployment.getId())
                .singleResult();
        if (definition == null) {
            throw new AppException(EngineErrorCode.DEPLOYMENT_FAILED);
        }
        log.info("Deployed process key={} version={} deployment={}",
                definition.getKey(), definition.getVersion(), deployment.getId());
        return DeploymentResponse.builder()
                .deploymentId(deployment.getId())
                .processDefinitionId(definition.getId())
                .processDefinitionKey(definition.getKey())
                .processDefinitionVersion(definition.getVersion())
                .bpmnXml(result.getXml())
                .build();
    }
}
