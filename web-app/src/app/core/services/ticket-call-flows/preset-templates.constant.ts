import { ProcessTemplateItem } from './template.service';

/**
 * 4 quy trình mẫu cho màn danh sách, mỗi mẫu 1 loại kích hoạt (Thủ công / Tự động / Lập lịch / Hybrid).
 * Luồng chung: Bắt đầu → Điều kiện (Đủ thông tin → Tác vụ hệ thống · Mặc định → Giao việc · Lỗi → Báo lỗi xử lý → Kết thúc) → Gộp nhánh
 * → Quy trình con → Thông báo → Kết thúc. `flowDefinition` theo đúng FLOW_SCHEMA.md.
 * ⚠ Dữ liệu giả lập — chờ API danh sách quy trình.
 */

type GatewayType = 'GATEWAY_EXCLUSIVE' | 'GATEWAY_PARALLEL' | 'GATEWAY_INCLUSIVE';

interface PresetFlowOptions {
  /** Số thứ tự mẫu, dùng sinh id node / edge cố định */
  seq: number;
  gatewayType: GatewayType;
  gatewayName: string;
  /** Biến khởi tạo ở node Bắt đầu */
  startVariables: Array<{ name: string; formField: string | null; apiField: string | null; value: string | null; displayName: string }>;
  /** Biến định danh hồ sơ (truyền vào API / quy trình con) */
  idVar: string;
  /** Biến mức ưu tiên (điều kiện nhánh "Đủ thông tin") */
  priorityVar: string;
  /** Biến số điện thoại / người nhận thông báo; null → gửi cho người dùng hệ thống */
  recipientVar: string | null;
  assignType: 'MANUAL' | 'AUTO';
  formId: string;
  subProcessId: string;
}

/** Id dạng UUID cố định theo mẫu + thứ tự node */
const uuid = (seq: number, n: number, prefix = '0') =>
  `${prefix}${String(seq).padStart(7, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

function buildPresetFlow(o: PresetFlowOptions): any {
  const id = (n: number) => uuid(o.seq, n);
  const edgeId = (n: number) => uuid(o.seq, n, 'e');
  const isParallel = o.gatewayType === 'GATEWAY_PARALLEL';
  const caseId = `c_du_thong_tin_${o.seq}`;

  const nodes = [
    {
      id: id(1), type: 'START', name: 'Bắt đầu', key: 'bat_dau', description: '',
      position: { x: 40, y: 128 },
      config: { variables: o.startVariables },
    },
    {
      id: id(2), type: o.gatewayType, name: o.gatewayName, key: 'kiem_tra_thong_tin', description: 'Rẽ nhánh theo mức độ đầy đủ của hồ sơ',
      position: { x: 180, y: 96 },
      config: {
        cases: [
          {
            id: caseId,
            name: 'Đủ thông tin',
            logicOperator: 'AND',
            // Chạy song song: mọi nhánh đều chạy, không cần điều kiện
            conditions: isParallel ? [] : [{ field: o.priorityVar, operator: 'IN', value: 'Cao, Khẩn' }],
          },
        ],
        joinNodeId: id(5),
      },
    },
    {
      id: id(3), type: 'SYSTEM_TASK', name: 'Trả lời sơ bộ', key: 'tra_loi_so_bo', description: 'Gọi CRM tạo phản hồi sơ bộ cho khách hàng',
      position: { x: 480, y: 16 },
      config: {
        systemId: 'crm', apiId: 'crm_ticket_create', timeout: 30, retry: 3,
        inputs: [{ apiParam: 'ticketId', variable: o.idVar }],
        outputs: [{ apiField: 'result', variable: 'ket_qua_tra_loi', displayName: 'Kết quả trả lời sơ bộ' }],
      },
    },
    {
      id: id(4), type: 'USER_TASK', name: 'Bổ sung thông tin', key: 'bo_sung_thong_tin', description: 'Điện thoại viên liên hệ khách hàng bổ sung hồ sơ',
      position: { x: 480, y: 176 },
      config: {
        assignType: o.assignType,
        assignStrategy: o.assignType === 'AUTO' ? 'ROUND_ROBIN' : null,
        departmentId: 'cskh', groupIds: ['team_bo'], agentIds: ['agent_01', 'agent_10'],
        slaValue: 2, slaUnit: 'Ngày', slaWarning: true,
        formId: o.formId,
        inputs: [{ variable: o.idVar, formField: 'ticket_level_1' }],
        outputs: [{ formField: 'content', variable: 'noi_dung_bo_sung', displayName: 'Nội dung bổ sung' }],
      },
    },
    {
      id: id(5), type: 'JOIN', name: 'Tất cả nhánh đến', key: 'gop_nhanh', description: '',
      position: { x: 800, y: 96 },
      config: { gatewayNodeId: id(2) },
    },
    {
      id: id(6), type: 'SUB_PROCESS', name: 'Quy trình con', key: 'quy_trinh_con', description: 'Xác minh thông tin bằng quy trình dùng chung',
      position: { x: 1100, y: 96 },
      config: {
        subProcessId: o.subProcessId,
        inputs: [{ subField: 'ticketId', variable: o.idVar }],
        outputs: [{ subField: 'result', variable: 'ket_qua_xac_minh', displayName: 'Kết quả xác minh' }],
      },
    },
    {
      id: id(7), type: 'NOTIFICATION', name: 'Gửi thông báo', key: 'gui_thong_bao', description: '',
      position: { x: 1400, y: 96 },
      config: o.recipientVar
        ? {
          channel: 'SMS', recipientSource: 'VARIABLE', recipientVariable: o.recipientVar, recipientUserIds: [],
          title: 'Kết quả xử lý hồ sơ', content: 'Hồ sơ của Quý khách đã được xử lý. Cảm ơn Quý khách đã liên hệ.',
        }
        : {
          channel: 'EMAIL', recipientSource: 'USER', recipientVariable: null, recipientUserIds: ['an.nguyen', 'binh.tran'],
          title: 'Kết quả chiến dịch gọi ra', content: 'Chiến dịch gọi ra định kỳ đã hoàn tất, vui lòng kiểm tra báo cáo.',
        },
    },
    {
      // Nhánh Lỗi: báo quản trị viên khi bước kiểm tra lỗi, rồi kết thúc
      id: id(9), type: 'NOTIFICATION', name: 'Báo lỗi xử lý', key: 'bao_loi_xu_ly', description: 'Thông báo quản trị viên khi bước kiểm tra thông tin gặp lỗi',
      position: { x: 480, y: 336 },
      config: {
        channel: 'EMAIL', recipientSource: 'USER', recipientVariable: null, recipientUserIds: ['an.nguyen'],
        title: 'Lỗi xử lý quy trình', content: 'Bước kiểm tra thông tin gặp lỗi, vui lòng kiểm tra lại hồ sơ.',
      },
    },
    {
      id: id(8), type: 'END', name: 'Kết thúc', key: 'ket_thuc', description: '',
      position: { x: 1700, y: 128 },
      config: { endFormId: 'done', results: [{ variable: 'ket_qua_xac_minh', formField: 'result' }] },
    },
  ];

  const edge = (n: number, source: number, sourceHandle: string, target: number) =>
    ({ id: edgeId(n), source: id(source), sourceHandle, target: id(target) });
  const edges = [
    edge(1, 1, 'next', 2),
    edge(2, 2, caseId, 3),
    edge(3, 2, 'default', 4),
    // Nhánh Lỗi → Báo lỗi xử lý → Kết thúc
    edge(9, 2, 'error', 9),
    edge(10, 9, 'next', 8),
    edge(4, 3, 'success', 5),
    edge(5, 4, 'next', 5),
    edge(6, 5, 'next', 6),
    edge(7, 6, 'next', 7),
    edge(8, 7, 'next', 8),
  ];
  return { nodes, edges, viewport: { zoom: 1, x: 0, y: 0 } };
}

/** Thông tin hiển thị ở màn danh sách (người tạo / ban hành, phiên bản) */
function listMeta(code: string, status: ProcessTemplateItem['status'], createdAt: string, createdBy: string, publishedAt?: string, publishedBy?: string) {
  return {
    version: 'V1.0',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    slaStatus: 'normal' as const,
    status,
    created_at: createdAt,
    created_by: createdBy,
    published_at: publishedAt,
    published_by: publishedBy,
    updatedAt: publishedAt || createdAt,
    updated_by: publishedBy || createdBy,
    active_instances_count: 0,
    versions: [
      {
        version_id: `ver-${code.toLowerCase()}-1`,
        version_no: 'V1.0',
        status,
        published_at: publishedAt || '',
        created_by: createdBy,
        changelog: 'Khởi tạo quy trình',
        is_active: true,
      },
    ],
  };
}

export const DEFAULT_PRESET_TEMPLATES: ProcessTemplateItem[] = [
  // ===== 1. Kích hoạt thủ công · Chọn một nhánh =====
  {
    code: 'QT_KHIEU_NAI_THU_CONG',
    name: 'Xử lý khiếu nại tiếp nhận tại quầy',
    category: 'Xử lý khiếu nại',
    description: 'Điện thoại viên nhập phiếu khiếu nại, hệ thống phân luồng theo mức độ ưu tiên và phản hồi khách hàng.',
    triggerType: 'MANUAL',
    triggerConfig: { manual: { inputFormId: 'form_tiep_nhan' } },
    slaValue: 3, slaUnit: 'Ngày', sla: '3 Ngày',
    ...listMeta('QT_KHIEU_NAI_THU_CONG', 'Published', '01/10/2026 08:30', 'Nguyễn Văn An', '02/10/2026 09:00', 'Lê Văn Hùng'),
    flowDefinition: buildPresetFlow({
      seq: 1,
      gatewayType: 'GATEWAY_EXCLUSIVE',
      gatewayName: 'Kiểm tra thông tin',
      startVariables: [
        { name: 'ma_ho_so', formField: 'ticket_level_1', apiField: null, value: null, displayName: 'Mã hồ sơ' },
        { name: 'muc_uu_tien', formField: 'priority', apiField: null, value: null, displayName: 'Mức ưu tiên' },
        { name: 'so_dien_thoai', formField: 'customer_phone', apiField: null, value: null, displayName: 'Số điện thoại khách hàng' },
        { name: 'noi_dung_khieu_nai', formField: 'content', apiField: null, value: null, displayName: 'Nội dung khiếu nại' },
      ],
      idVar: 'ma_ho_so', priorityVar: 'muc_uu_tien', recipientVar: 'so_dien_thoai',
      assignType: 'MANUAL', formId: 'form_tiep_nhan', subProcessId: 'QT_TICKET_TU_DONG',
    }),
  },

  // ===== 2. Kích hoạt tự động · Chọn nhiều nhánh =====
  {
    code: 'QT_TICKET_TU_DONG',
    name: 'Xử lý ticket tự động từ CRM',
    category: 'Xử lý ticket quá hạn',
    description: 'CRM tạo ticket mới → hệ thống tự khởi tạo quy trình khi ticket thuộc nhóm khiếu nại, ưu tiên cao.',
    triggerType: 'AUTO',
    triggerConfig: {
      auto: {
        apiId: 'crm-ticket-create',
        conditions: {
          logicOperator: 'AND',
          rules: [
            { param: 'ticketType', operator: 'IN', value: 'KHIEU_NAI, PHAN_ANH' },
            { param: 'priority', operator: 'NEQ', value: 'Thấp' },
          ],
        },
      },
    },
    slaValue: 8, slaUnit: 'Giờ', sla: '8 Giờ',
    ...listMeta('QT_TICKET_TU_DONG', 'Published', '03/10/2026 10:15', 'Trần Thị Bình', '04/10/2026 14:20', 'Lê Văn Hùng'),
    flowDefinition: buildPresetFlow({
      seq: 2,
      gatewayType: 'GATEWAY_INCLUSIVE',
      gatewayName: 'Phân loại ticket',
      startVariables: [
        { name: 'ma_ticket', formField: 'ticketId', apiField: null, value: null, displayName: 'Mã ticket' },
        { name: 'loai_ticket', formField: 'ticketType', apiField: null, value: null, displayName: 'Loại ticket' },
        { name: 'muc_do_uu_tien', formField: 'priority', apiField: null, value: null, displayName: 'Mức độ ưu tiên' },
        { name: 'ma_khach_hang', formField: 'customerId', apiField: null, value: null, displayName: 'Mã khách hàng' },
      ],
      idVar: 'ma_ticket', priorityVar: 'muc_do_uu_tien', recipientVar: 'ma_khach_hang',
      assignType: 'AUTO', formId: 'form_khieu_nai', subProcessId: 'QT_KHIEU_NAI_THU_CONG',
    }),
  },

  // ===== 3. Lập lịch · Chạy song song =====
  {
    code: 'QT_HAPPY_CALL_DINH_KY',
    name: 'Happy call khách hàng định kỳ hàng tuần',
    category: 'Happy call khách hàng sau bán',
    description: 'Mỗi thứ 2 và thứ 4 lúc 08:00, hệ thống tạo chiến dịch gọi lại khách hàng mới hoà mạng.',
    triggerType: 'SCHEDULE',
    triggerConfig: { schedule: { mode: 'REPEAT', runDate: '', runTime: '08:00', repeat: 'WEEKLY', weekDays: [1, 3], monthDays: [] } },
    slaValue: 1, slaUnit: 'Tuần', sla: '1 Tuần',
    ...listMeta('QT_HAPPY_CALL_DINH_KY', 'Draft', '06/10/2026 16:40', 'Phạm Thị Dung'),
    flowDefinition: buildPresetFlow({
      seq: 3,
      gatewayType: 'GATEWAY_PARALLEL',
      gatewayName: 'Xử lý song song',
      startVariables: [
        { name: 'ma_chien_dich', formField: null, apiField: null, value: 'HC_TUAN', displayName: 'Mã chiến dịch' },
        { name: 'nhom_khach_hang', formField: null, apiField: null, value: 'KH_MOI_HOA_MANG', displayName: 'Nhóm khách hàng' },
        { name: 'muc_uu_tien_goi', formField: null, apiField: null, value: 'Cao', displayName: 'Mức ưu tiên gọi' },
      ],
      idVar: 'ma_chien_dich', priorityVar: 'muc_uu_tien_goi', recipientVar: null,
      assignType: 'AUTO', formId: 'form_tiep_nhan', subProcessId: 'QT_KHIEU_NAI_THU_CONG',
    }),
  },

  // ===== 4. Hybrid · Chọn một nhánh =====
  {
    code: 'QT_HO_TRO_KY_THUAT_HYBRID',
    name: 'Hỗ trợ kỹ thuật đa kênh',
    category: 'Hậu mãi',
    description: 'Khởi tạo thủ công từ quầy hoặc tự động khi CRM ghi nhận khiếu nại kỹ thuật mức độ cao.',
    triggerType: 'HYBRID',
    triggerConfig: {
      hybrid: {
        apiId: 'crm-complaint-create',
        inputFormId: 'form_khieu_nai',
        conditions: {
          logicOperator: 'AND',
          rules: [
            { param: 'complaintType', operator: 'EQ', value: 'KY_THUAT' },
            { param: 'severity', operator: 'GTE', value: '3' },
          ],
        },
      },
    },
    slaValue: 48, slaUnit: 'Giờ', sla: '48 Giờ',
    ...listMeta('QT_HO_TRO_KY_THUAT_HYBRID', 'Inactive', '07/10/2026 09:05', 'Hoàng Văn Em', '08/10/2026 10:30', 'Trần Thị Bình'),
    flowDefinition: buildPresetFlow({
      seq: 4,
      gatewayType: 'GATEWAY_EXCLUSIVE',
      gatewayName: 'Đánh giá mức độ sự cố',
      startVariables: [
        { name: 'ma_khieu_nai', formField: 'ticket_level_1', apiField: 'complaintId', value: null, displayName: 'Mã khiếu nại' },
        { name: 'loai_su_co', formField: 'complaint_type', apiField: 'complaintType', value: null, displayName: 'Loại sự cố' },
        { name: 'muc_do', formField: 'priority', apiField: 'severity', value: null, displayName: 'Mức độ' },
        { name: 'sdt_lien_he', formField: 'customer_phone', apiField: 'customerId', value: null, displayName: 'Số điện thoại liên hệ' },
      ],
      idVar: 'ma_khieu_nai', priorityVar: 'muc_do', recipientVar: 'sdt_lien_he',
      assignType: 'MANUAL', formId: 'form_khieu_nai', subProcessId: 'QT_TICKET_TU_DONG',
    }),
  },
];
