package com.lifesup.ticketflow.engine.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.flowable.bpmn.model.FieldExtension;
import org.flowable.bpmn.model.ServiceTask;

/** Tạo field extension với giá trị JSON ổn định cho task delegate. */
final class BpmnFieldExtensionHelper {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private BpmnFieldExtensionHelper() {
    }

    static void add(ServiceTask task, String name, Object value) {
        if (value == null) return;
        FieldExtension field = new FieldExtension();
        field.setFieldName(name);
        field.setStringValue(serialize(value));
        task.getFieldExtensions().add(field);
    }

    private static String serialize(Object value) {
        if (value instanceof String || value instanceof Number || value instanceof Boolean)
            return String.valueOf(value);
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Cannot serialize task field", exception);
        }
    }
}
