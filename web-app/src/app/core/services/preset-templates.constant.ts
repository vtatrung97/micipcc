import { ProcessTemplateItem } from './template.service';

/** Mẫu quy trình dựng sẵn (cơ bản, trung bình, phức tạp) và dữ liệu giả cho màn danh sách. */
export const DEFAULT_PRESET_TEMPLATES: ProcessTemplateItem[] = [
  // ===== Mẫu 1: luồng tuyến tính cơ bản =====
  {
    code: 'PRC_BASIC_CSAT_FEEDBACK',
    name: 'Quy trình tiếp nhận và ghi nhận ý kiến đóng góp khách hàng (CSAT)',
    category: 'Khảo sát CSAT',
    version: 'V1.0',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    sla: '1h SLA',
    slaStatus: 'normal',
    status: 'Published',
    description: 'Tiếp nhận ý kiến phản hồi từ Webhook/Portal, tổng đài viên ghi nhận và tự động gửi SMS Brandname cảm ơn.',
    published_at: '05/10/2026 16:30',
    updatedAt: '05/10/2026 16:30',
    active_instances_count: 2,
    versions: [
      {
        version_id: 'ver-csat-101',
        version_no: 'V1.0',
        status: 'Published',
        published_at: '05/10/2026 16:30',
        created_by: 'Admin Hệ thống',
        changelog: 'Ban hành luồng cơ bản CSAT',
        is_active: true
      }
    ]
  },

  // ===== Mẫu 2: exclusive gateway + action API =====
  {
    code: 'PRC_BILLING_DISPUTE_REVERSAL',
    name: 'Quy trình xử lý khiếu nại cước & Tự động hoàn cước viễn thông',
    category: 'Xử lý khiếu nại',
    version: 'V2.0',
    owner_org_id: 'ORG_BILLING',
    owner_org_name: 'Trung tâm Đối soát & Tính cước',
    sla: '2h SLA',
    slaStatus: 'normal',
    status: 'Published',
    description: 'Tiếp nhận khiếu nại cước: Cước <= 200k tự động hoàn qua API Core BSS; Cước > 200k chuyển Trưởng ca phê duyệt.',
    published_at: '05/10/2026 16:35',
    updatedAt: '05/10/2026 16:35',
    active_instances_count: 8,
    versions: [
      {
        version_id: 'ver-bill-201',
        version_no: 'V2.0',
        status: 'Published',
        published_at: '05/10/2026 16:35',
        created_by: 'Admin Hệ thống',
        changelog: 'Tích hợp API Core BSS tự động hoàn cước và nhánh rẽ điều kiện',
        is_active: true
      }
    ]
  },

  // ===== Mẫu 3: parallel split/join + subprocess + đa kênh =====
  {
    code: 'PRC_VIP_ENTERPRISE_INCIDENT',
    name: 'Quy trình điều hành xử lý sự cố hạ tầng & Kênh truyền số liệu KHDN VIP',
    category: 'Cảnh báo chỉ số',
    version: 'V4.0',
    owner_org_id: 'ORG_KT_BROADBAND',
    owner_org_name: 'Phòng Kỹ thuật Broadband',
    sla: '2h SLA',
    slaStatus: 'warning',
    status: 'Published',
    description: 'Xử lý sự cố kênh truyền VIP: Chạy song song luồng kỹ thuật đo kiểm BTS (SubProcess) và CSKH KAM đa kênh SMS/Email, hội tụ đóng ticket tự động.',
    published_at: '05/10/2026 16:40',
    updatedAt: '05/10/2026 16:40',
    active_instances_count: 5,
    versions: [
      {
        version_id: 'ver-vip-401',
        version_no: 'V4.0',
        status: 'Published',
        published_at: '05/10/2026 16:40',
        created_by: 'Admin Hệ thống',
        changelog: 'Tối ưu nhánh song song và tích hợp quy trình con BTS',
        is_active: true
      }
    ]
  },

  // ===== Mẫu 4: mẫu Viettel Customer Service mặc định =====
  {
    code: 'PRC_MULTI_DEPT_COMPLAINT',
    name: 'Xử lý khiếu nại đa phòng ban',
    category: 'Xử lý khiếu nại',
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    version: '4',
    sla: '2h SLA',
    slaStatus: 'normal',
    status: 'Draft',
    description: 'Quy trình tiếp nhận, phối hợp và xử lý khiếu nại đa phòng ban Viettel Customer Service',
    published_at: '05/10/2026 14:30',
    updatedAt: '05/10/2026 14:30',
    active_instances_count: 5,
    versions: [
      {
        version_id: 'ver-multi-401',
        version_no: 'V4.0',
        status: 'Draft',
        published_at: '05/10/2026 14:30',
        created_by: 'Admin Hệ thống',
        changelog: 'Khởi tạo quy trình đa phòng ban',
        is_active: true
      }
    ]
  },

  // ===== Dữ liệu giả cho màn danh sách (đủ trạng thái ban hành / dừng ban hành) =====
  ...[
    { code: 'ALT-2026', name: 'Giám sát và cảnh báo chỉ số', category: 'Cảnh báo chỉ số', version: 'V3.0', status: 'Published', triggerType: 'AUTO', slaValue: 4, slaUnit: 'Giờ', created_at: '10/03/2026 09:15', created_by: 'Lê Thị Hương', published_at: '12/03/2026 10:00', published_by: 'Lê Văn Hùng' },
    { code: 'SUR-2026', name: 'Khảo sát sau tương tác', category: 'Khảo sát CSAT', version: 'V2.0', status: 'Inactive', triggerType: 'SCHEDULE', slaValue: 1, slaUnit: 'Ngày', created_at: '10/04/2026 08:30', created_by: 'Phạm Minh Tuấn', published_at: '13/04/2026 14:20', published_by: 'Phạm Minh Tuấn' },
    { code: 'HPC-2026', name: 'Happy Call khách hàng mới hòa mạng', category: 'Happy Call / Telesales', version: 'V1.2', status: 'Published', triggerType: 'MANUAL', slaValue: 2, slaUnit: 'Ngày', created_at: '02/05/2026 13:45', created_by: 'Nguyễn Thị Lệ', published_at: '05/05/2026 09:00', published_by: 'Trần Văn Bình' },
    { code: 'FUP-2026', name: 'Chăm sóc lại khách hàng sau khiếu nại', category: 'Chăm sóc sau tương tác', version: 'V1.0', status: 'Inactive', triggerType: 'HYBRID', slaValue: 48, slaUnit: 'Giờ', created_at: '18/05/2026 16:10', created_by: 'Trần Văn Bình', published_at: '20/05/2026 08:45', published_by: 'Lê Văn Hùng' },
    { code: 'NET-2026', name: 'Xử lý sự cố mất kết nối Internet cáp quang', category: 'Xử lý khiếu nại', version: 'V5.1', status: 'Published', triggerType: 'AUTO', slaValue: 30, slaUnit: 'Phút', created_at: '01/06/2026 07:50', created_by: 'Lê Văn Hùng', published_at: '03/06/2026 11:30', published_by: 'Nguyễn Thị Lệ' },
    { code: 'TLS-2026', name: 'Telesales gói cước data tháng', category: 'Happy Call / Telesales', version: 'V2.3', status: 'Inactive', triggerType: 'SCHEDULE', slaValue: 3, slaUnit: 'Ngày', created_at: '15/06/2026 10:05', created_by: 'Lê Thị Hương', published_at: '17/06/2026 15:40', published_by: 'Phạm Minh Tuấn' }
  ].map((m): ProcessTemplateItem => ({
    ...m,
    status: m.status as ProcessTemplateItem['status'],
    triggerType: m.triggerType as ProcessTemplateItem['triggerType'],
    owner_org_id: 'ORG_CSKH_MB',
    owner_org_name: 'TT CSKH Miền Bắc',
    sla: `${m.slaValue} ${m.slaUnit}`,
    slaStatus: 'normal',
    description: `Dữ liệu giả: ${m.name}`,
    updatedAt: m.published_at,
    active_instances_count: 0,
    versions: [
      {
        version_id: `ver-${m.code.toLowerCase()}`,
        version_no: m.version,
        status: m.status as ProcessTemplateItem['status'],
        published_at: m.published_at,
        created_by: m.published_by,
        changelog: 'Dữ liệu giả cho màn danh sách',
        is_active: true
      }
    ]
  }))
];
