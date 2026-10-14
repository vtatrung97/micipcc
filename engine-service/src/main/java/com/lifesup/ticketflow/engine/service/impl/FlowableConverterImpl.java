package com.lifesup.ticketflow.engine.service.impl;

import com.lifesup.ticketflow.engine.converter.BpmnModelBuilder;
import com.lifesup.ticketflow.engine.dto.canvas.CanvasDocument;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowDefinition;
import com.lifesup.ticketflow.engine.mapper.CanvasWorkflowMapper;
import com.lifesup.ticketflow.engine.parser.CanvasDocumentParser;
import com.lifesup.ticketflow.engine.service.FlowableConverterService;
import com.lifesup.ticketflow.engine.validation.FlowableModelValidator;
import com.lifesup.ticketflow.engine.validation.WorkflowValidator;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.converter.BpmnXMLConverter;
import org.flowable.bpmn.model.BpmnModel;
import org.springframework.stereotype.Service;

/**
 * Chuyển flowJson của Canvas thành BPMN của Flowable, hoàn toàn trong memory:
 * <pre>
 *  parse JSON → map (cấu hình strict) → validate quy trình → dựng BpmnModel → validator Flowable → XML
 * </pre>
 * Lỗi ở bất kỳ bước nào ném WorkflowValidationException kèm toàn bộ lỗi của bước đó.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlowableConverterImpl implements FlowableConverterService {
    CanvasDocumentParser parser;
    CanvasWorkflowMapper mapper;
    WorkflowValidator workflowValidator;
    BpmnModelBuilder modelBuilder;
    FlowableModelValidator flowableValidator;

    @Override
    public ConversionResult convert(ConversionCommand command) {
        Objects.requireNonNull(command, "command is required");
        CanvasDocument document = parser.parse(command.getModelJson());
        WorkflowDefinition workflow = mapper.map(document, command.getProcessKey(), command.getProcessName());
        workflowValidator.validate(workflow);

        BpmnModel model = modelBuilder.build(workflow);
        flowableValidator.validate(model);
        String xml = new String(new BpmnXMLConverter().convertToXML(model), StandardCharsets.UTF_8);
        return new ConversionResult(model, xml);
    }
}
