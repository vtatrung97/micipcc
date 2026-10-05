package com.lifesup.ticketflow.engine.dto.flowable;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.model.BpmnModel;

/** Kết quả chuyển đổi gồm model Flowable và XML nằm trong memory. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversionResult {
    BpmnModel bpmnModel;
    String bpmnXml;
}
