package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.common.enums.NodeType;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.util.List;
import java.util.Map;
import org.flowable.bpmn.model.CallActivity;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.IOParameter;
import org.springframework.stereotype.Component;

/** Chuyển SUB_PROCESS thành call activity. */
@Component
public final class SubProcessNodeConverter extends AbstractNodeConverter {
    @Override public NodeType supports() { return NodeType.SUB_PROCESS; }

    @Override
    public FlowElement convert(WorkflowNode node) {
        CallActivity activity = named(new CallActivity(), node);
        String subProcessId = String.valueOf(node.getConfig().get("subProcessId"));
        activity.setCalledElement("${subProcessResolver.resolve('" + subProcessId + "')}");
        mappings(node, "inputMapping").forEach(mapping -> activity.addInParameter(inputParameter(mapping)));
        mappings(node, "outputMapping").forEach(mapping -> activity.addOutParameter(outputParameter(mapping)));
        return activity;
    }

    private static IOParameter inputParameter(Map<String, Object> mapping) {
        IOParameter parameter = new IOParameter();
        parameter.setSource(string(mapping.get("output")));
        parameter.setTarget(string(mapping.get("input")));
        return parameter;
    }

    private static IOParameter outputParameter(Map<String, Object> mapping) {
        IOParameter parameter = new IOParameter();
        parameter.setSource(string(mapping.get("input")));
        parameter.setTarget(string(mapping.get("output")));
        return parameter;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> mappings(WorkflowNode node, String key) {
        Object value = node.getConfig().get(key);
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream().filter(Map.class::isInstance).map(item -> (Map<String, Object>) item).toList();
    }

    private static String string(Object value) { return value instanceof String text ? text : null; }
}
