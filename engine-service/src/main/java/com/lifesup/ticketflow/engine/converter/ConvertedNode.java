package com.lifesup.ticketflow.engine.converter;

import java.util.List;
import java.util.Map;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.FlowNode;

/**
 * Kết quả chuyển một node Canvas: có thể là một hoặc nhiều phần tử BPMN.
 *
 * <pre>
 *  edge vào ──► entry ... mainExit ──► edge ra (next / success / caseId / default)
 *                         handleExits[error] ──► edge ra nhánh error (boundary event)
 * </pre>
 *
 * @param entry       phần tử nhận edge đi vào
 * @param mainExit    phần tử phát edge đi ra mặc định
 * @param handleExits phần tử phát edge cho handle riêng (VD error → boundary event)
 * @param elements    toàn bộ phần tử cần thêm vào process, kể cả sequence flow nội bộ
 */
public record ConvertedNode(FlowNode entry, FlowNode mainExit, Map<String, FlowNode> handleExits,
        List<FlowElement> elements) {

    /** Node chỉ gồm một phần tử. */
    public static ConvertedNode single(FlowNode element) {
        return new ConvertedNode(element, element, Map.of(), List.of(element));
    }

    /** Phần tử phát edge cho sourceHandle. */
    public FlowNode exit(String sourceHandle) {
        return handleExits.getOrDefault(sourceHandle, mainExit);
    }
}
