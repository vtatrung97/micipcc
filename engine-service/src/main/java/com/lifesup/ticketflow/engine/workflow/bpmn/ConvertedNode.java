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
 * Kết quả chuyển một node Canvas. Một node Canvas luôn cho đúng một ConvertedNode, bên trong có thể gồm một
 * hoặc nhiều phần tử BPMN (VD SYSTEM_TASK / GATEWAY có nhánh error).
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

    /*
     * Khi chuyển sang BPMN, một node Canvas có thể thành nhiều phần tử
     *  (kiểu như SYSTEM_TASK, GATEWAY có nhánh err)
     * -> có thể là một hoặc nhiều phần tử BPMN.
     */

    /** Phần tử nhận edge đi vào. */
    FlowNode entry;
    /** Phần tử phát edge đi ra (mặc định). */
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
