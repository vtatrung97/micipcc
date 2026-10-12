import { Injectable } from '@angular/core';
import { edgeAttrs } from '../config/edge-style.config';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeFactoryService } from './node-factory.service';
import { GatewayJoinService } from './gateway-join.service';
import { NodeEditorService } from './node-editor.service';
import { GraphHistoryService } from './graph-history.service';
import { GraphLayoutService } from './graph-layout.service';
import { GraphCanvasService } from './graph-canvas.service';

/** Các flow mẫu (mặc định, cơ bản, điều kiện + API, phức tạp, trống). */
@Injectable()
export class SampleFlowService {
  constructor(
    private store: GraphEditorStore,
    private factory: NodeFactoryService,
    private gatewayJoin: GatewayJoinService,
    private editor: NodeEditorService,
    private history: GraphHistoryService,
    private layout: GraphLayoutService,
    private canvas: GraphCanvasService
  ) {}


  // FLOW MẪU MẶC ĐỊNH
  // ▶ -> [◇ Tên bước quy trình] -> (Đủ thông tin -> </> Trả lời sơ bộ) & (Mặc định -> 👤 Bổ sung thông tin)
  //   -> ⤹ Tất cả nhánh đến -> 👤 Xác minh khiếu nại -> </> Cập nhật & đóng PAKN -> ⏹
  public createCompactWorkflowSample(): void {
    if (!this.store.graph) return;
    this.store.graph.clearCells();

    // 1. [Start] (trigger)
    const trigger = this.factory.createCompactCardNode('START', 40, 185, '');

    // 2. [Condition] Tên bước quy trình
    const condition = this.factory.createCompactCardNode(
      'GATEWAY_EXCLUSIVE',
      150,
      155,
      'Tên bước quy trình',
      {
        nodeKey: 'CND_BRANCH_CHECK',
        description:
          'Phân nhánh xử lý theo điều kiện đầy đủ thông tin hay mặc định',
        branches: [
          {
            id: 'br-info',
            name: 'Đủ thông tin',
            value: 'du_thong_tin',
            expression: '${flow.variables.du_thong_tin == true}',
            isDefault: false,
          },
          {
            id: 'br-default',
            name: 'Mặc định',
            value: 'default',
            expression: 'default',
            isDefault: true,
          },
        ],
      },
    );

    // 3. [Action] Trả lời sơ bộ
    const traLoiSoBo = this.factory.createCompactCardNode(
      'SYSTEM_TASK',
      390,
      115,
      'Trả lời sơ bộ',
      {
        nodeKey: 'ACT_PRELIMINARY_REPLY',
        description: 'Hệ thống gửi tin nhắn/phản hồi sơ bộ cho khách hàng',
      },
    );

    // 4. [Task] Bổ sung thông tin
    const boSungThongTin = this.factory.createCompactCardNode(
      'USER_TASK',
      390,
      215,
      'Bổ sung thông tin',
      {
        nodeKey: 'TSK_SUPPLEMENT_INFO',
        description:
          'Yêu cầu khách hàng hoặc điện thoại viên bổ sung thêm thông tin khiếu nại',
      },
    );

    // 5. [Merge] Tất cả nhánh đến
    const tatCaNhanhDen = this.factory.createCompactCardNode(
      'JOIN',
      620,
      165,
      'Tất cả nhánh đến',
      {
        nodeKey: 'MRG_JOIN_BRANCHES',
        description: 'Gom và đồng bộ kết quả từ các nhánh xử lý',
      },
    );

    // 6. [Task] Xác minh khiếu nại
    const xacMinhKhieuNai = this.factory.createCompactCardNode(
      'USER_TASK',
      840,
      165,
      'Xác minh khiếu nại',
      {
        nodeKey: 'TSK_VERIFY_COMPLAINT',
        description:
          'Chuyên viên tiến hành xác minh thông tin khiếu nại của khách hàng',
      },
    );

    // 7. [Action] Cập nhật & đóng PAKN
    const capNhatDong = this.factory.createCompactCardNode(
      'SYSTEM_TASK',
      1060,
      165,
      'Cập nhật & đóng PAKN',
      {
        nodeKey: 'ACT_UPDATE_CLOSE_PAKN',
        description:
          'Cập nhật trạng thái xử lý và đóng phản ánh khiếu nại trên hệ thống',
      },
    );

    // 8. [End]
    const end = this.factory.createCompactCardNode('END', 1290, 168, '');

    this.gatewayJoin.linkGatewayJoin(condition, tatCaNhanhDen);

    // Edge 1: trigger -> condition
    this.store.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: condition, port: 'in' },
      attrs: edgeAttrs(),
    });

    // Edge 2: condition (br-info) -> Trả lời sơ bộ
    this.store.graph.addEdge({
      source: { cell: condition, port: 'br-info' },
      target: { cell: traLoiSoBo, port: 'in' },
      attrs: edgeAttrs(),
    });

    // Edge 3: condition (br-default) -> Bổ sung thông tin
    this.store.graph.addEdge({
      source: { cell: condition, port: 'br-default' },
      target: { cell: boSungThongTin, port: 'in' },
      attrs: edgeAttrs(),
    });

    // Edge 4: Trả lời sơ bộ -> Tất cả nhánh đến
    this.store.graph.addEdge({
      source: { cell: traLoiSoBo, port: 'out' },
      target: { cell: tatCaNhanhDen, port: 'in-merge-0' },
      attrs: edgeAttrs(),
    });

    // Edge 5: Bổ sung thông tin -> Tất cả nhánh đến
    this.store.graph.addEdge({
      source: { cell: boSungThongTin, port: 'out' },
      target: { cell: tatCaNhanhDen, port: 'in-merge-1' },
      attrs: edgeAttrs(),
    });

    // Edge 6: Tất cả nhánh đến -> Xác minh khiếu nại
    this.store.graph.addEdge({
      source: { cell: tatCaNhanhDen, port: 'out' },
      target: { cell: xacMinhKhieuNai, port: 'in' },
      attrs: edgeAttrs(),
    });

    // Edge 7: Xác minh khiếu nại -> Cập nhật & đóng PAKN
    this.store.graph.addEdge({
      source: { cell: xacMinhKhieuNai, port: 'out' },
      target: { cell: capNhatDong, port: 'in' },
      attrs: edgeAttrs(),
    });

    // Edge 8: Cập nhật & đóng PAKN -> End
    this.store.graph.addEdge({
      source: { cell: capNhatDong, port: 'out' },
      target: { cell: end, port: 'in' },
      attrs: edgeAttrs(),
    });

    this.editor.clearSelection();
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
  }


  public createBlankWorkflowSample(): void {
    if (!this.store.graph) return;
    this.store.graph.clearCells();
    const trigger = this.factory.createCompactCardNode(
      'START',
      80,
      160,
      'Tiếp nhận cước',
    );
    this.editor.selectNode(trigger);
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
  }


  // CÁC MẪU QUY TRÌNH KHÁC (theo JSON spec của BE)

  /**
   * MẪU 1: LUỒNG CƠ BẢN (LINEAR BASIC FLOW)
   * Tiếp nhận & Phản hồi Ý kiến CSAT (Trigger -> Task -> Notification -> End)
   */
  public loadSampleBasicFlow(): void {
    if (!this.store.graph) return;
    this.store.graph.clearCells();

    this.store.currentTemplate = {
      code: 'PRC_BASIC_CSAT_FEEDBACK',
      name: 'Quy trình tiếp nhận và ghi nhận ý kiến đóng góp khách hàng (CSAT)',
      category: 'Khảo sát CSAT',
      version: 'V1.0',
      owner_org_id: 'ORG_CSKH_MB',
      owner_org_name: 'TT CSKH Miền Bắc',
      sla: '1h SLA',
      slaStatus: 'normal',
      status: 'Published',
      description:
        'Tiếp nhận ý kiến phản hồi từ cổng thông tin, tổng đài viên ghi nhận và tự động gửi SMS cảm ơn',
    };

    // 1. Trigger
    const trigger = this.factory.createCompactCardNode(
      'START',
      60,
      185,
      'Bắt đầu tiếp nhận',
      {
        nodeKey: 'TRG_CSAT_01',
        triggerType: 'Webhook',
        triggerEvent: 'Portal CSAT Feedback Submitted',
        triggerFormSchedule: 'Tức thời (Real-time)',
        description: 'Nhận payload JSON từ Web portal hoặc My Viettel app',
      },
    );

    // 2. Task
    const task = this.factory.createCompactCardNode(
      'USER_TASK',
      230,
      165,
      'Giao việc phân loại',
      {
        nodeKey: 'TSK_CSAT_REVIEW',
        department: 'TT CSKH Miền Bắc',
        team: 'Nhóm Chăm sóc khách hàng',
        agent: 'Điện thoại viên (FO/BO)',
        assignee: 'Điện thoại viên (FO/BO)',
        sla: '30 phút',
        slaWarning: true,
        formTemplate: 'FORM_CSAT_FEEDBACK_V1',
        formOutput: 'output_csat_classification',
        description: 'Kiểm tra nội dung góp ý, gắn tag phân loại chủ đề',
      },
    );

    // 3. Notification
    const notif = this.factory.createCompactCardNode(
      'NOTIFICATION',
      500,
      165,
      'Gửi SMS cảm ơn',
      {
        nodeKey: 'NTF_CSAT_THANKYOU',
        notificationChannel: 'SMS',
        channelNotification: true,
        notificationRecipient: '${flow.variables.customer_phone}',
        notificationTitle: 'Viettel CSKH - Cảm ơn quý khách',
        notificationContent:
          'Viettel chân thành cảm ơn ý kiến đóng góp của Quý khách. Chúc Quý khách một ngày tốt lành!',
        description: 'Gửi tin nhắn Brandname VIETTEL đến số thuê bao phản ánh',
      },
    );

    // 4. End
    const end = this.factory.createCompactCardNode('END', 770, 185, 'Kết thúc', {
      nodeKey: 'END_CSAT_01',
      description: 'Đóng luồng và lưu vết lịch sử instance',
    });

    // Edges
    this.store.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: task, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: task, port: 'out' },
      target: { cell: notif, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: notif, port: 'out' },
      target: { cell: end, port: 'in' },
      attrs: edgeAttrs(),
    });

    this.editor.clearSelection();
    this.store.graph.centerContent();
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
    this.store.selectedCellInfo = '✨ Đã tải [Mẫu 1: Luồng cơ bản CSAT]!';
  }


  /**
   * MẪU 2: LUỒNG TRUNG BÌNH (EXCLUSIVE GATEWAY + ACTION API)
   * Xử lý Khiếu nại Cước & Tự động Hoàn cước viễn thông
   */
  public loadSampleConditionApiFlow(): void {
    if (!this.store.graph) return;
    this.store.graph.clearCells();

    this.store.currentTemplate = {
      code: 'PRC_BILLING_DISPUTE_REVERSAL',
      name: 'Quy trình xử lý khiếu nại cước & Tự động hoàn cước viễn thông',
      category: 'Xử lý khiếu nại',
      version: 'V2.0',
      owner_org_id: 'ORG_BILLING',
      owner_org_name: 'Trung tâm Đối soát & Tính cước',
      sla: '2h SLA',
      slaStatus: 'normal',
      status: 'Published',
      description:
        'Tiếp nhận khiếu nại cước: Dưới 200k tự động hoàn cước qua API Core; Trên 200k chuyển Trưởng ca phê duyệt',
    };

    // 1. Trigger
    const trigger = this.factory.createCompactCardNode(
      'START',
      40,
      205,
      'Tiếp nhận khiếu nại',
      {
        nodeKey: 'TRG_BILLING_01',
        triggerType: 'Inbound Call',
        triggerEvent: 'Customer Call via Hotline 18008098',
      },
    );

    // 2. Task Tra cứu
    const taskCheck = this.factory.createCompactCardNode(
      'USER_TASK',
      160,
      185,
      'Tra cứu chi tiết cước',
      {
        nodeKey: 'TSK_CHECK_CDR',
        department: 'Trung tâm Đối soát & Tính cước',
        team: 'Tổ Xử lý khiếu nại cước',
        agent: 'Điện thoại viên (FO/BO)',
        sla: '45 phút',
        formTemplate: 'FORM_CDR_VERIFY_V2',
        formOutput: 'output_verified_amount',
      },
    );

    // 3. Condition (Chọn một nhánh)
    const condition = this.factory.createCompactCardNode(
      'GATEWAY_EXCLUSIVE',
      400,
      160,
      'Kiểm tra hạn mức cước',
      {
        nodeKey: 'CND_AMOUNT_CHECK',
        conditionVariable: 'flow.variables.dispute_amount',
        branches: [
          {
            id: 'br-auto',
            name: 'Cước <= 200k (Tự động)',
            value: 'LE_200K',
            expression: 'flow.variables.dispute_amount <= 200000',
            isDefault: false,
          },
          {
            id: 'br-manual',
            name: 'Mặc định (> 200k)',
            value: 'GT_200K',
            expression: 'default',
            isDefault: true,
          },
        ],
      },
    );

    // 4. Action Hoàn cước API
    const actRefund = this.factory.createCompactCardNode(
      'SYSTEM_TASK',
      670,
      95,
      'Tác vụ hoàn cước API',
      {
        nodeKey: 'ACT_CORE_REFUND',
        actionSource: 'custom',
        integratedSystem: 'BILLING_CORE_BSS',
        selectedApi: 'POST /api/v2/invoices/reverse-charge',
        actionMethod: 'POST',
        actionEndpoint:
          'https://billing-core.viettel.vn/api/v2/invoices/reverse-charge',
        timeoutSeconds: 5,
        retryCount: 3,
        hasExceptionPort: true,
      },
    );

    // 5. Task Trưởng ca duyệt (Approval)
    const taskApprove = this.factory.createCompactCardNode(
      'USER_TASK',
      670,
      240,
      'Trưởng ca duyệt hoàn cước',
      {
        nodeKey: 'TSK_LEADER_APPROVE',
        department: 'TT CSKH Miền Bắc',
        team: 'Ban Giám đốc / Trưởng ca',
        agent: 'Trưởng ca trực',
        isApprovalStep: true,
        sla: '1h SLA',
      },
    );

    // 6. Notification SMS
    const notif = this.factory.createCompactCardNode(
      'NOTIFICATION',
      930,
      95,
      'SMS thông báo kết quả',
      {
        nodeKey: 'NTF_REFUND_SUCCESS',
        notificationChannel: 'SMS',
        notificationRecipient: '${flow.variables.customer_phone}',
        notificationTitle: 'Viettel - Kết quả đối soát cước',
      },
    );

    // 7. End thành công
    const endSuccess = this.factory.createCompactCardNode(
      'END',
      1190,
      115,
      'Hoàn tất thành công',
      {
        nodeKey: 'END_BILLING_SUCCESS',
      },
    );

    // 8. End lỗi
    const endError = this.factory.createCompactCardNode(
      'END',
      930,
      260,
      'Kết thúc lỗi ngoại lệ',
      {
        nodeKey: 'END_BILLING_ERROR',
      },
    );

    // Edges
    this.store.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: taskCheck, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: taskCheck, port: 'out' },
      target: { cell: condition, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: condition, port: 'br-auto' },
      target: { cell: actRefund, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: condition, port: 'br-manual' },
      target: { cell: taskApprove, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: taskApprove, port: 'out-approve' },
      target: { cell: actRefund, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: taskApprove, port: 'out-reject' },
      target: { cell: endError, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: actRefund, port: 'out-success' },
      target: { cell: notif, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: actRefund, port: 'out-failure' },
      target: { cell: endError, port: 'in' },
      attrs: {
        line: {
          stroke: '#ef4444',
          strokeWidth: 1.5,
          strokeDasharray: 4,
          targetMarker: { name: 'block', width: 6, height: 6, fill: '#ef4444' },
        },
      },
    });
    this.store.graph.addEdge({
      source: { cell: notif, port: 'out' },
      target: { cell: endSuccess, port: 'in' },
      attrs: edgeAttrs(),
    });

    this.editor.clearSelection();
    this.store.graph.centerContent();
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
    this.store.selectedCellInfo = '✨ Đã tải [Mẫu 2: Luồng điều kiện & API cước]!';
  }


  /**
   * MẪU 3: LUỒNG PHỨC TẠP ENTERPRISE (PARALLEL SPLIT/JOIN, SUBPROCESS, MULTI-CHANNEL)
   * Điều hành xử lý sự cố hạ tầng & Kênh truyền số liệu VIP
   */
  public loadSampleComplexEnterpriseFlow(): void {
    if (!this.store.graph) return;
    this.store.graph.clearCells();

    this.store.currentTemplate = {
      code: 'PRC_VIP_ENTERPRISE_INCIDENT',
      name: 'Quy trình điều hành xử lý sự cố hạ tầng & Kênh truyền số liệu KHDN VIP',
      category: 'Cảnh báo chỉ số',
      version: 'V4.0',
      owner_org_id: 'ORG_KT_BROADBAND',
      owner_org_name: 'Phòng Kỹ thuật Broadband',
      sla: '2h SLA',
      slaStatus: 'warning',
      status: 'Published',
      description:
        'Xử lý sự cố kênh truyền VIP: Chạy song song luồng kỹ thuật đo kiểm (SubProcess) và CSKH KAM đa kênh SMS/Email, hội tụ đóng ticket tự động',
    };

    // 1. Trigger
    const trigger = this.factory.createCompactCardNode(
      'START',
      40,
      195,
      'Cảnh báo NMS Kênh truyền',
      {
        nodeKey: 'TRG_NMS_ALARM',
        triggerType: 'Hệ thống giám sát NMS',
      },
    );

    // 2. Task
    const taskTriage = this.factory.createCompactCardNode(
      'USER_TASK',
      150,
      175,
      'Điều phối & Phân loại cấp 1',
      {
        nodeKey: 'TSK_INCIDENT_TRIAGE',
        department: 'Phòng Kỹ thuật Broadband',
        team: 'Tổ Điều hành mạng NOC',
        sla: '15 phút',
      },
    );

    // 3. Parallel Split
    const split = this.factory.createCompactCardNode(
      'GATEWAY_PARALLEL',
      370,
      150,
      'Chạy song song 2 luồng',
      {
        nodeKey: 'SPL_PARALLEL_DISPATCH',
        branches: [
          {
            id: 'br-tech',
            name: 'Nhánh Kỹ thuật hạ tầng',
            expression: 'true',
            isDefault: false,
          },
          {
            id: 'br-kam',
            name: 'Nhánh Chăm sóc KH VIP',
            expression: 'true',
            isDefault: true,
          },
        ],
      },
    );

    // 4. SubProcess
    const subProcess = this.factory.createCompactCardNode(
      'SUB_PROCESS',
      610,
      95,
      'Quy trình con: Kỹ thuật trạm',
      {
        nodeKey: 'SUB_NETWORK_DIAGNOSIS',
        subProcessTemplateId: 'PRC_BTS_SITE_MAINTENANCE',
        subProcessVersion: 'V2.3',
        subProcessWaitComplete: true,
      },
    );

    // 5. Task KAM
    const taskKam = this.factory.createCompactCardNode(
      'USER_TASK',
      610,
      245,
      'Quản lý KH VIP liên hệ',
      {
        nodeKey: 'TSK_KAM_SUPPORT',
        department: 'Phòng Kinh doanh & Telesales',
        team: 'Bộ phận Quản lý Khách hàng Lớn (KAM)',
        sla: '20 phút',
      },
    );

    // 6. Notification VIP
    const notifVip = this.factory.createCompactCardNode(
      'NOTIFICATION',
      840,
      245,
      'Gửi SMS & Email cam kết SLA',
      {
        nodeKey: 'NTF_VIP_SLA_COMMIT',
        notificationChannel: 'SMS, Email',
        channelNotification: true,
        channelEmail: true,
      },
    );

    // 7. Join Parallel (Sử dụng merge)
    const joinNode = this.factory.createCompactCardNode(
      'JOIN',
      1080,
      175,
      'Hội tụ đồng bộ 2 luồng',
      {
        nodeKey: 'JON_PARALLEL_SYNC',
      },
    );

    this.gatewayJoin.linkGatewayJoin(split, joinNode);

    // 8. Action CRM
    const actCrm = this.factory.createCompactCardNode(
      'SYSTEM_TASK',
      1280,
      175,
      'Đóng ticket trên CRM BSS',
      {
        nodeKey: 'ACT_CLOSE_TICKET_CRM',
        integratedSystem: 'VIETTEL_CRM_ENTERPRISE',
        actionMethod: 'PUT',
      },
    );

    // 9. Notification Handover
    const notifReport = this.factory.createCompactCardNode(
      'NOTIFICATION',
      1500,
      175,
      'Email biên bản nghiệm thu',
      {
        nodeKey: 'NTF_HANDOVER_REPORT',
        notificationChannel: 'Email',
        channelEmail: true,
      },
    );

    // 10. End
    const end = this.factory.createCompactCardNode(
      'END',
      1730,
      195,
      'Hoàn tất sự cố VIP',
      {
        nodeKey: 'END_VIP_INCIDENT',
      },
    );

    // Edges
    this.store.graph.addEdge({
      source: { cell: trigger, port: 'out' },
      target: { cell: taskTriage, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: taskTriage, port: 'out' },
      target: { cell: split, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: split, port: 'br-tech' },
      target: { cell: subProcess, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: split, port: 'br-kam' },
      target: { cell: taskKam, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: taskKam, port: 'out' },
      target: { cell: notifVip, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: subProcess, port: 'out' },
      target: { cell: joinNode, port: 'in-merge-0' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: notifVip, port: 'out' },
      target: { cell: joinNode, port: 'in-merge-1' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: joinNode, port: 'out' },
      target: { cell: actCrm, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: actCrm, port: 'out' },
      target: { cell: notifReport, port: 'in' },
      attrs: edgeAttrs(),
    });
    this.store.graph.addEdge({
      source: { cell: notifReport, port: 'out' },
      target: { cell: end, port: 'in' },
      attrs: edgeAttrs(),
    });

    this.editor.clearSelection();
    this.store.graph.centerContent();
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
    this.store.selectedCellInfo = '✨ Đã tải [Mẫu 3: Luồng phức tạp Song song/VIP]!';
  }


  public loadSampleFlow(
    type: 'basic' | 'medium' | 'complex' | 'default',
  ): void {
    if (type === 'basic') this.loadSampleBasicFlow();
    else if (type === 'medium') this.loadSampleConditionApiFlow();
    else if (type === 'complex') this.loadSampleComplexEnterpriseFlow();
    else this.createCompactWorkflowSample();
    // Toạ độ trong các mẫu tính cho card cũ → xếp lại theo kích thước card mới (240 × 72)
    this.layout.autoLayout(true);
    // Hiện trọn luồng trong khung nhìn (đợi container có kích thước khi vừa khởi tạo)
    setTimeout(() => this.canvas.zoomToFit());
  }
}
