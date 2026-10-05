package com.lifesup.ticketflow.engine.service;

import com.lifesup.ticketflow.engine.dto.flowable.ConversionCommand;
import com.lifesup.ticketflow.engine.dto.flowable.ConversionResult;

/** Service chuyển Canvas workflow thành Flowable BPMN trong memory. */
public interface FlowableConverterService {
    /** Validate và chuyển đổi một Canvas document thành BPMN model/XML. */
    ConversionResult convert(ConversionCommand command);
}
