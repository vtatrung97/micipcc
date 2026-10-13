package com.lifesup.ticketflow.engine.service;

import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;

/** Chuyển Canvas workflow thành Flowable BPMN trong memory. */
public interface FlowableConverterService {
    /** Validate và chuyển đổi; quy trình không hợp lệ ném WorkflowValidationException. */
    ConversionResult convert(ConversionCommand command);
}
