package com.lifesup.ticketflow.engine.workflow.bpmn;

import java.util.List;
import java.util.Map;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.FlowNode;

/**
 * Kết quả chuyển một node Canvas: có thể là một hoặc nhiều phần tử BPMN.
 *
 * <pre>
 *  edge vào ──► entry ... mainExit ──► edge ra (next / success / caseId / default)
 *                         handleExits[error] ──► edge ra nhánh error (boundary event)
 * </pre>
 */
@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConvertedNode {
    /** Phần tử nhận edge đi vào. */
    FlowNode entry;
    /** Phần tử phát edge đi ra mặc định. */
    FlowNode mainExit;
    /** Phần tử phát edge cho handle riêng (VD error → boundary event). */
    Map<String, FlowNode> handleExits;
    /** Toàn bộ phần tử cần thêm vào process, kể cả sequence flow nội bộ. */
    List<FlowElement> elements;

    /** Node chỉ gồm một phần tử. */
    public static ConvertedNode single(FlowNode element) {
        return new ConvertedNode(element, element, Map.of(), List.of(element));
    }

    /** Phần tử phát edge cho sourceHandle. */
    public FlowNode exit(String sourceHandle) {
        return handleExits.getOrDefault(sourceHandle, mainExit);
    }
}
