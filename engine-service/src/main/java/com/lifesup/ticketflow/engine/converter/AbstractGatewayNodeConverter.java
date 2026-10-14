package com.lifesup.ticketflow.engine.converter;

import com.lifesup.ticketflow.engine.bpmn.BpmnConstants;
import com.lifesup.ticketflow.engine.bpmn.BpmnExpressions;
import com.lifesup.ticketflow.engine.bpmn.BpmnExtensions;
import com.lifesup.ticketflow.engine.common.constants.SourceHandles;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayCase;
import com.lifesup.ticketflow.engine.dto.canvas.model.GatewayNodeConfig;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowEdge;
import com.lifesup.ticketflow.engine.dto.workflow.WorkflowNode;
import java.util.List;
import java.util.Map;
import org.flowable.bpmn.model.BoundaryEvent;
import org.flowable.bpmn.model.Gateway;
import org.flowable.bpmn.model.SequenceFlow;
import org.flowable.bpmn.model.ServiceTask;

/**
 * Chuyển gateway. Gateway có điều kiện (exclusive / inclusive):
 * <ul>
 *   <li>mỗi nhánh là một sequence flow có điều kiện gọi ConditionEvaluator;</li>
 *   <li>nhánh {@code default} là default flow của gateway;</li>
 *   <li>có nhánh {@code error}: BPMN không cho gắn boundary vào gateway, nên chèn một service task
 *       "đánh giá điều kiện" trước gateway, lỗi đánh giá → boundary error → nhánh error.</li>
 * </ul>
 *
 * <pre>
 *  ──► [Đánh giá điều kiện] ──► &lt;gateway&gt; ──caseId / default──►
 *            └─(GATEWAY_ERROR)──────────────────error──►
 * </pre>
 *
 * Gateway parallel chạy mọi nhánh (kể cả nhánh default), không có điều kiện.
 */
abstract class AbstractGatewayNodeConverter extends AbstractNodeConverter {

    /** Phần tử gateway BPMN tương ứng loại node. */
    protected abstract Gateway newGateway();

    @Override
    public ConvertedNode convert(WorkflowNode node, ConversionContext context) {
        Gateway gateway = init(newGateway(), node, context);
        boolean hasErrorBranch = node.getType().isConditionalGateway()
                && context.hasOutgoing(node.getId(), SourceHandles.ERROR);
        if (!hasErrorBranch) {
            return ConvertedNode.single(gateway);
        }

        ServiceTask evaluation = new ServiceTask();
        evaluation.setId(context.newId(gateway.getId(), "_evaluate"));
        evaluation.setName("Đánh giá điều kiện: " + node.getName());
        delegateTo(evaluation, BpmnExpressions.BEAN_GATEWAY_EVALUATION_DELEGATE);
        BpmnExtensions.put(evaluation, BpmnConstants.EXTENSION_GATEWAY_REF, gateway.getId());
        BoundaryEvent error = errorBoundary(evaluation, BpmnConstants.ERROR_GATEWAY, context);
        SequenceFlow toGateway = context.connect(evaluation, gateway);

        return new ConvertedNode(evaluation, gateway, Map.of(SourceHandles.ERROR, error),
                List.of(evaluation, error, gateway, toGateway));
    }

    @Override
    public void configureOutgoingFlow(SequenceFlow flow, WorkflowEdge edge, WorkflowNode node,
            ConversionContext context) {
        String handle = edge.getSourceHandle();
        if (SourceHandles.ERROR.equals(handle)) {
            return;
        }
        boolean conditional = node.getType().isConditionalGateway();
        if (SourceHandles.DEFAULT.equals(handle)) {
            if (conditional) {
                ((Gateway) flow.getSourceFlowElement()).setDefaultFlow(flow.getId());
            }
            return;
        }
        GatewayCase gatewayCase = node.config(GatewayNodeConfig.class).getCases().stream()
                .filter(item -> handle.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Unknown gateway case: " + handle));
        flow.setName(gatewayCase.getName());
        if (conditional) {
            String gatewayId = context.bpmnId(node.getId());
            flow.setConditionExpression(BpmnExpressions.caseCondition(gatewayId, gatewayCase.getId()));
        }
    }
}
