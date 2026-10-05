import { ProcessTemplateItem } from './template.service';

/**
 * 3 MẪU QUY TRÌNH CHUẨN DOANH NGHIỆP VIETTEL CUSTOMER SERVICE
 * Dựa trên các đặc tả JSON gửi Backend (Basic, Medium, Complex)
 */
export const DEFAULT_PRESET_TEMPLATES: ProcessTemplateItem[] = [
  // ==========================================================================
  // MẪU 1: LUỒNG CƠ BẢN (LINEAR BASIC FLOW)
  // ==========================================================================
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

  // ==========================================================================
  // MẪU 2: LUỒNG TRUNG BÌNH (EXCLUSIVE GATEWAY + ACTION API)
  // ==========================================================================
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

  // ==========================================================================
  // MẪU 3: LUỒNG PHỨC TẠP ENTERPRISE (PARALLEL SPLIT/JOIN + SUBPROCESS + MULTI-CHANNEL)
  // ==========================================================================
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

  // ==========================================================================
  // MẪU 4: MẪU VIETTEL CUSTOMER SERVICE MẶC ĐỊNH
  // ==========================================================================
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
  }
];
