package com.lifesup.ticketflow.engine.workflow;

import com.lifesup.ticketflow.engine.workflow.bpmn.BpmnModelBuilder;
import com.lifesup.ticketflow.engine.workflow.canvas.CanvasWorkflowMapper;
import com.lifesup.ticketflow.engine.workflow.model.definition.WorkflowDefinition;
import com.lifesup.ticketflow.engine.workflow.validation.FlowableModelValidator;
import com.lifesup.ticketflow.engine.workflow.validation.WorkflowValidator;
import java.nio.charset.StandardCharsets;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.BpmnModel;
import org.springframework.stereotype.Component;

/**
 * Chuyển flowJson của Canvas thành BPMN của Flowable, hoàn toàn trong memory:
 * <pre>
 *  flowJson → map (cấu hình strict) → validate → dựng BpmnModel → validator Flowable → XML
 * </pre>
 * Lỗi ở bước nào cũng ném WorkflowValidationException kèm toàn bộ lỗi của bước đó.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WorkflowConverter {
    CanvasWorkflowMapper mapper;
    WorkflowValidator validator;
    BpmnModelBuilder modelBuilder;
    FlowableModelValidator flowableValidator;

    /** @param processKey mã template, dùng làm id process BPMN (process definition key) */
    public Result convert(String processKey, String processName, String flowJson) {
        WorkflowDefinition workflow = mapper.map(flowJson, processKey, processName);
        validator.validate(workflow);
        BpmnModel model = modelBuilder.build(workflow);
        flowableValidator.validate(model);
        String xml = new String(new BpmnXMLConverter().convertToXML(model), StandardCharsets.UTF_8);
        return new Result(model, xml);
    }

    /** BpmnModel để kiểm tra / deploy và XML tương ứng. */
    @Getter
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
    public static class Result {
        BpmnModel model;
        String xml;
    }
}
