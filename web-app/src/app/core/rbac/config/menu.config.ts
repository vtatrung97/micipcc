/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - DYNAMIC RBAC MENU SYSTEM
 * File: menu.config.ts
 * Description: Danh mục Menu Cố định Chuẩn hóa 9 Phân hệ Nghiệp vụ (M1 - M7)
 *              Không cho phép tự ý kéo-thả đổi tên / đổi URL ngoài hệ thống.
 *              Tất cả quyền hạn được bảo vệ chặt chẽ bởi RBAC Matrix.
 * ============================================================================
 */

import { MenuItem, RouteRbacConfig, UserRole, UserSession, ResourceType, ActionPermission, ModuleCode } from '../models/rbac.types';

/**
 * Cấu hình cây Menu chuẩn hóa cố định của toàn bộ hệ thống Flow System (IPCC 2.0)
 */
export const SYSTEM_MENU_CONFIG: MenuItem[] = [
  // ==========================================================================
  // M1: Quản lý Quy trình (Process Templates)
  // ==========================================================================
  {
    key: 'm1_process_management',
    label: 'Quản lý Quy trình',
    icon: 'partition',
    moduleCode: 'M1',
    requiredResource: 'Template',
    requiredPermission: 'view',
    children: [
      {
        key: 'm1_templates_list',
        label: 'Danh sách Template',
        path: '/templates/templates-management',
        icon: 'table',
        moduleCode: 'M1',
        requiredResource: 'Template',
        requiredPermission: 'view'
      },
      {
        key: 'm1_action_library',
        label: 'Thư viện Action dùng chung',
        path: '/templates/action-library',
        icon: 'appstore',
        moduleCode: 'M1',
        requiredResource: 'ActionLibrary',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M2: Quản lý Flow Instance
  // ==========================================================================
  {
    key: 'm2_flow_instances',
    label: 'M2: Quản lý Flow Instance',
    icon: 'branches',
    moduleCode: 'M2',
    requiredResource: 'Instance',
    requiredPermission: 'view',
    children: [
      {
        key: 'm2_realtime_monitor',
        label: 'Giám sát tiến trình thời gian thực',
        path: '/instances/monitor',
        icon: 'fund',
        moduleCode: 'M2',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      },
      {
        key: 'm2_execution_history',
        label: 'Lịch sử thực thi & Audit (US-23)',
        path: '/instances/history',
        icon: 'history',
        moduleCode: 'M2',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      },
      {
        key: 'm2_immutable_logs',
        label: 'Nhật ký Log hệ thống (FR-15)',
        path: '/instances/logs',
        icon: 'file-text',
        moduleCode: 'M2',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M3: Quản lý Task
  // ==========================================================================
  {
    key: 'm3_task_management',
    label: 'M3: Quản lý Task',
    icon: 'check-square',
    moduleCode: 'M3',
    requiredResource: 'Task',
    requiredPermission: 'view',
    badge: {
      count: 14,
      variant: 'primary',
      tooltip: '14 Task đang chờ bạn xử lý'
    },
    badgeWarning: {
      count: 3,
      variant: 'danger',
      isPulse: true,
      tooltip: 'CẢNH BÁO: 3 Task đã vượt quá hạn cam kết SLA'
    },
    children: [
      {
        key: 'm3_my_tasks',
        label: 'Task của tôi (My Tasks)',
        path: '/tasks/my-tasks',
        icon: 'user-switch',
        moduleCode: 'M3',
        requiredResource: 'Task',
        requiredPermission: 'view',
        badge: {
          count: 14,
          variant: 'primary',
          tooltip: 'Tổng Task được giao'
        },
        badgeWarning: {
          count: 3,
          variant: 'danger',
          isPulse: true,
          tooltip: '3 Task quá hạn SLA'
        }
      },
      {
        key: 'm3_process_task',
        label: 'Xử lý Task (Duyệt/Reject US-21)',
        path: '/tasks/process',
        icon: 'form',
        moduleCode: 'M3',
        requiredResource: 'Task',
        requiredPermission: 'view'
      },
      {
        key: 'm3_reference_data',
        label: 'Master Data tham chiếu (View-only)',
        path: '/tasks/reference',
        icon: 'database',
        moduleCode: 'M3',
        requiredResource: 'Task',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M4: Báo cáo & Dashboard
  // ==========================================================================
  {
    key: 'm4_reports_dashboards',
    label: 'M4: Báo cáo & Dashboard',
    icon: 'dashboard',
    moduleCode: 'M4',
    requiredResource: 'Report',
    requiredPermission: 'view',
    children: [
      {
        key: 'm4_overview_dashboard',
        label: 'Dashboard tổng quan (US-09)',
        path: '/reports/dashboard',
        icon: 'pie-chart',
        moduleCode: 'M4',
        requiredResource: 'Dashboard',
        requiredPermission: 'view'
      },
      {
        key: 'm4_sla_process_report',
        label: 'Báo cáo SLA & Quy trình',
        path: '/reports/sla-process',
        icon: 'bar-chart',
        moduleCode: 'M4',
        requiredResource: 'Report',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M5: Cấu hình Vận hành (Admin Console)
  // ==========================================================================
  {
    key: 'm5_operation_settings',
    label: 'M5: Cấu hình Vận hành',
    icon: 'setting',
    moduleCode: 'M5',
    requiredResource: 'Integration',
    requiredPermission: 'view',
    children: [
      {
        key: 'm5_sla_escalation',
        label: 'Cấu hình SLA & Leo thang (US-10)',
        path: '/settings/sla-escalation',
        icon: 'alert',
        moduleCode: 'M5',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'm5_auto_assignment',
        label: 'Phân việc tự động (US-12)',
        path: '/settings/auto-assignment',
        icon: 'sync',
        moduleCode: 'M5',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'm5_inbound_channels',
        label: 'Kênh tiếp nhận (Zalo/SMS/Webhook)',
        path: '/settings/inbound-channels',
        icon: 'api',
        moduleCode: 'M5',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'm5_notification_templates',
        label: 'Mẫu Email & Thông báo (US-15/30)',
        path: '/settings/notification-templates',
        icon: 'mail',
        moduleCode: 'M5',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M6: Master Data (Tham chiếu dữ liệu)
  // ==========================================================================
  {
    key: 'm6_master_data',
    label: 'M6: Master Data',
    icon: 'folder-open',
    moduleCode: 'M6',
    requiredResource: 'MasterData',
    requiredPermission: 'view',
    children: [
      {
        key: 'm6_subscribers',
        label: 'Tra cứu thông tin thuê bao (US-16)',
        path: '/master-data/subscribers',
        icon: 'idcard',
        moduleCode: 'M6',
        requiredResource: 'MasterData',
        requiredPermission: 'view'
      },
      {
        key: 'm6_products_services',
        label: 'Danh mục Sản phẩm/Dịch vụ (US-17)',
        path: '/master-data/products-services',
        icon: 'shopping-cart',
        moduleCode: 'M6',
        requiredResource: 'MasterData',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M7: Quản trị Hệ thống
  // ==========================================================================
  {
    key: 'm7_system_admin',
    label: 'M7: Quản trị Hệ thống',
    icon: 'safety-certificate',
    moduleCode: 'M7',
    requiredResource: 'SystemAdmin',
    requiredPermission: 'view',
    children: [
      {
        key: 'm7_organization',
        label: 'Cơ cấu tổ chức & Phòng ban (US-18)',
        path: '/admin/organization',
        icon: 'team',
        moduleCode: 'M7',
        requiredResource: 'SystemAdmin',
        requiredPermission: 'view'
      },
      {
        key: 'm7_users_management',
        label: 'Quản lý danh sách Người dùng',
        path: '/admin/users',
        icon: 'user',
        moduleCode: 'M7',
        requiredResource: 'SystemAdmin',
        requiredPermission: 'view'
      },
      {
        key: 'm7_roles_permissions',
        label: 'Phân quyền & Vai trò (FR-38)',
        path: '/admin/roles-permissions',
        icon: 'lock',
        moduleCode: 'M7',
        requiredResource: 'SystemAdmin',
        requiredPermission: 'view'
      }
    ]
  }
];

// ============================================================================
// ĐỊNH NGHĨA CÁC PHIÊN BẢN USER MẪU (PRESET USERS CHO MÔ PHỎNG & TESTING RBAC)
// ============================================================================

export const PRESET_USERS: Record<UserRole, UserSession> = {
  // 1. ADMIN: Toàn quyền xem và cấu hình toàn bộ M1 -> M7
  ADMIN: {
    userId: 'usr_admin_001',
    username: 'admin.flow',
    fullName: 'Nguyễn Quản Trị (Super Admin)',
    role: 'ADMIN',
    roleTitle: 'Quản trị viên Hệ thống Toàn quyền',
    department: 'Trung tâm Công nghệ Thông tin IPCC',
    permissions: [
      { resource: 'Template', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'ActionLibrary', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Instance', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Task', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Dashboard', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Report', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Integration', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'MasterData', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'SystemAdmin', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' }
    ]
  },

  // 1b. SUPER_ADMIN: Toàn quyền tối cao
  SUPER_ADMIN: {
    userId: 'usr_super_admin_000',
    username: 'super.admin',
    fullName: 'Tổng Quản Trị Tối Cao (Super Admin)',
    role: 'SUPER_ADMIN',
    roleTitle: 'Super Administrator',
    department: 'Ban Giám đốc & Trung tâm Vận hành',
    permissions: [
      { resource: 'Template', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'ActionLibrary', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Instance', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Task', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Dashboard', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Report', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'Integration', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'MasterData', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' },
      { resource: 'SystemAdmin', actions: ['view', 'create', 'edit', 'delete', 'execute'], scope: 'All' }
    ]
  },

  // 2. SUPERVISOR: Xem M1, M2 (Instance Timeline), M3, M4 (Báo cáo & Dashboard), M6. Ẩn M5, M7.
  SUPERVISOR: {
    userId: 'usr_sup_002',
    username: 'supervisor.ipcc',
    fullName: 'Trần Giám Sát (Trưởng ca IPCC)',
    role: 'SUPERVISOR',
    roleTitle: 'Giám sát Vận hành & Chất lượng',
    department: 'Khối Vận hành Tổng đài Contact Center',
    permissions: [
      { resource: 'Template', actions: ['view', 'execute'], scope: 'Organization' },
      { resource: 'ActionLibrary', actions: ['view'], scope: 'Organization' },
      { resource: 'Instance', actions: ['view', 'execute'], scope: 'Organization' },
      { resource: 'Task', actions: ['view', 'edit', 'execute'], scope: 'Group' },
      { resource: 'Dashboard', actions: ['view'], scope: 'Organization' },
      { resource: 'Report', actions: ['view', 'create'], scope: 'Organization' },
      { resource: 'MasterData', actions: ['view'], scope: 'Organization' }
      // Lưu ý: Không có quyền 'view' trên 'Integration' (M5) và 'SystemAdmin' (M7) -> Tự động ẩn!
    ]
  },

  // 3. AGENT / OPERATOR: Chỉ xem M3 (Task của tôi) và M6 (Master data tra cứu). Ẩn M1, M2, M4, M5, M7.
  AGENT: {
    userId: 'usr_agent_003',
    username: 'agent.contact',
    fullName: 'Lê Điện Thoại Viên (Agent FO/BO)',
    role: 'AGENT',
    roleTitle: 'Chuyên viên Tiếp nhận & Xử lý Cuộc gọi',
    department: 'Tổ Tiếp nhận Khách hàng VIP',
    permissions: [
      { resource: 'Task', actions: ['view', 'edit', 'execute'], scope: 'Own' },
      { resource: 'MasterData', actions: ['view'], scope: 'Own' }
      // Lưu ý: Không có quyền 'view' trên M1, M2, M4, M5, M7 -> Ẩn hoàn toàn!
    ]
  },

  // 4. CUSTOM ROLE: Cho phép tùy biến trực tiếp để test ma trận quyền
  CUSTOM: {
    userId: 'usr_custom_999',
    username: 'custom.tester',
    fullName: 'Tùy Chỉnh Quyền Hạn (Sandbox Testing)',
    role: 'CUSTOM',
    roleTitle: 'Tài khoản Kiểm thử Động',
    department: 'Phòng Đảm bảo Chất lượng QA',
    permissions: [
      { resource: 'Template', actions: ['view'], scope: 'Group' },
      { resource: 'Task', actions: ['view', 'edit'], scope: 'Own' },
      { resource: 'Report', actions: ['view'], scope: 'Group' },
      { resource: 'MasterData', actions: ['view'], scope: 'Group' }
    ]
  }
};

// ============================================================================
// TRANG MẶC ĐỊNH THEO TỪNG NHÓM VAI TRÒ (ROLE-BASED DEFAULT LANDING PAGE)
// Căn cứ nghiệp vụ: US-18, REQ-04, US-07, US-08, US-09
// 1. AGENT (Điện thoại viên FO/BO): Trang đầu tiên "Task của tôi" (M3 - US-07, FR-18)
// 2. SUPERVISOR (Giám sát / Quản lý): Trang đầu tiên Dashboard (M4 - US-08, US-09, FR-26)
// 3. ADMIN / SUPER_ADMIN: Dashboard tổng quan hệ thống (M4 - US-08)
// ============================================================================
export const ROLE_DEFAULT_LANDING_PAGES: Record<UserRole, string> = {
  AGENT: '/tasks/my-tasks',
  SUPERVISOR: '/reports/dashboard',
  ADMIN: '/templates/templates-management',
  SUPER_ADMIN: '/templates/templates-management',
  CUSTOM: '/tasks/my-tasks'
};

// ============================================================================
// MA TRẬN ROUTING & RBAC TẬP TRUNG (CENTRALIZED ROUTE RBAC MAP)
// Định nghĩa sẵn Route nào cần Resource & Action nào kèm Breadcrumbs chuẩn.
// Giúp Router không cần phải hardcode data: { resource, action } trong từng route.
// ============================================================================

export const SYSTEM_ROUTES = {
  // ==========================================================================
  // [PHÂN HỆ M1] - QUẢN LÝ QUY TRÌNH
  // ==========================================================================
  GRAPH: {
    path: 'templates/graph',
    fullPath: '/templates/graph',
    resource: 'Template' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Canvas Builder (BPMN 7 Nodes)',
    breadcrumbs: ['Quản lý Quy trình', 'Canvas Builder'],
    moduleCode: 'M1' as ModuleCode,
    title: 'M1: BPMN Canvas Builder (AntV X6)'
  },
  ACTION_LIBRARY: {
    path: 'templates/action-library',
    fullPath: '/templates/action-library',
    resource: 'ActionLibrary' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Thư viện Action dùng chung (US-34)',
    breadcrumbs: ['Quản lý Quy trình', 'Thư viện Action dùng chung'],
    moduleCode: 'M1' as ModuleCode,
    title: 'M1: Thư viện Action dùng chung'
  },
  TEMPLATES_MANAGEMENT: {
    path: 'templates/templates-management',
    fullPath: '/templates/templates-management',
    resource: 'Template' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Danh sách Template',
    breadcrumbs: ['Quản lý Quy trình', 'Danh sách Template'],
    moduleCode: 'M1' as ModuleCode,
    title: 'Danh sách Quy trình'
  },

  // ==========================================================================
  // [PHÂN HỆ M2] - QUẢN LÝ FLOW INSTANCE
  // ==========================================================================
  INSTANCES: {
    path: 'instances',
    fullPath: '/instances/monitor',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Giám sát tiến trình thời gian thực',
    breadcrumbs: ['M2: Quản lý Flow Instance', 'Giám sát tiến trình thời gian thực'],
    moduleCode: 'M2' as ModuleCode,
    title: 'M2: Giám sát tiến trình thời gian thực'
  },
  FLOW_INSTANCES: {
    path: 'flow-instances',
    fullPath: '/instances/monitor',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Giám sát tiến trình thời gian thực (Alias)',
    breadcrumbs: ['M2: Quản lý Flow Instance', 'Giám sát tiến trình thời gian thực'],
    moduleCode: 'M2' as ModuleCode,
    title: 'M2: Giám sát tiến trình thời gian thực'
  },
  INSTANCES_HISTORY: {
    path: 'instances/history',
    fullPath: '/instances/history',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Lịch sử thực thi & Audit (US-23)',
    breadcrumbs: ['M2: Quản lý Flow Instance', 'Lịch sử thực thi & Audit (US-23)'],
    moduleCode: 'M2' as ModuleCode,
    title: 'M2: Lịch sử thực thi & Audit Trail'
  },
  INSTANCES_LOGS: {
    path: 'instances/logs',
    fullPath: '/instances/logs',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Nhật ký Log hệ thống (FR-15)',
    breadcrumbs: ['M2: Quản lý Flow Instance', 'Nhật ký Log hệ thống (FR-15)'],
    moduleCode: 'M2' as ModuleCode,
    title: 'M2: Nhật ký Log hệ thống'
  },

  // ==========================================================================
  // [PHÂN HỆ M3] - QUẢN LÝ TASK
  // ==========================================================================
  TASKS: {
    path: 'tasks',
    fullPath: '/tasks/my-tasks',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Task của tôi (My Tasks)',
    breadcrumbs: ['M3: Quản lý Task', 'Task của tôi (My Tasks)'],
    moduleCode: 'M3' as ModuleCode,
    title: 'M3: Task của tôi (My Tasks)'
  },
  TASKS_PROCESS: {
    path: 'tasks/process',
    fullPath: '/tasks/process',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Xử lý Task (Duyệt/Reject US-21)',
    breadcrumbs: ['M3: Quản lý Task', 'Xử lý Task (Duyệt/Reject US-21)'],
    moduleCode: 'M3' as ModuleCode,
    title: 'M3: Xử lý & Phê duyệt Task'
  },
  TASKS_REFERENCE: {
    path: 'tasks/reference',
    fullPath: '/tasks/reference',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Master Data tham chiếu (View-only)',
    breadcrumbs: ['M3: Quản lý Task', 'Master Data tham chiếu (View-only)'],
    moduleCode: 'M3' as ModuleCode,
    title: 'M3: Master Data tham chiếu'
  },

  // ==========================================================================
  // [PHÂN HỆ M4] - BÁO CÁO & DASHBOARD
  // ==========================================================================
  REPORTS: {
    path: 'reports',
    fullPath: '/reports/dashboard',
    resource: 'Dashboard' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Dashboard tổng quan (US-09)',
    breadcrumbs: ['M4: Báo cáo & Dashboard', 'Dashboard tổng quan (US-09)'],
    moduleCode: 'M4' as ModuleCode,
    title: 'M4: Dashboard SLA & Vận hành'
  },
  REPORTS_SLA_PROCESS: {
    path: 'reports/sla-process',
    fullPath: '/reports/sla-process',
    resource: 'Report' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Báo cáo SLA & Quy trình',
    breadcrumbs: ['M4: Báo cáo & Dashboard', 'Báo cáo SLA & Quy trình'],
    moduleCode: 'M4' as ModuleCode,
    title: 'M4: Báo cáo chi tiết SLA theo Quy trình'
  },

  // ==========================================================================
  // [PHÂN HỆ M5] - THIẾT LẬP VẬN HÀNH
  // ==========================================================================
  SETTINGS: {
    path: 'settings',
    fullPath: '/settings/sla-escalation',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cấu hình SLA & Leo thang (US-10)',
    breadcrumbs: ['M5: Cấu hình Vận hành', 'Cấu hình SLA & Leo thang (US-10)'],
    moduleCode: 'M5' as ModuleCode,
    title: 'M5: Cấu hình SLA Escalation'
  },
  SETTINGS_AUTO_ASSIGNMENT: {
    path: 'settings/auto-assignment',
    fullPath: '/settings/auto-assignment',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Phân việc tự động (US-12)',
    breadcrumbs: ['M5: Cấu hình Vận hành', 'Phân việc tự động (US-12)'],
    moduleCode: 'M5' as ModuleCode,
    title: 'M5: Quy tắc chia Task tự động'
  },
  SETTINGS_INBOUND_CHANNELS: {
    path: 'settings/inbound-channels',
    fullPath: '/settings/inbound-channels',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Kênh tiếp nhận (Zalo/SMS/Webhook)',
    breadcrumbs: ['M5: Cấu hình Vận hành', 'Kênh tiếp nhận (Zalo/SMS/Webhook)'],
    moduleCode: 'M5' as ModuleCode,
    title: 'M5: Kênh tiếp nhận Webhook & API'
  },
  SETTINGS_NOTIFICATION_TEMPLATES: {
    path: 'settings/notification-templates',
    fullPath: '/settings/notification-templates',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Mẫu Email & Thông báo (US-15/30)',
    breadcrumbs: ['M5: Cấu hình Vận hành', 'Mẫu Email & Thông báo (US-15/30)'],
    moduleCode: 'M5' as ModuleCode,
    title: 'M5: Mẫu tin thông báo đa kênh'
  },

  // ==========================================================================
  // [PHÂN HỆ M6] - DỮ LIỆU DANH MỤC (MASTER DATA)
  // ==========================================================================
  MASTER_DATA: {
    path: 'master-data',
    fullPath: '/master-data/subscribers',
    resource: 'MasterData' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Tra cứu thông tin thuê bao (US-16)',
    breadcrumbs: ['M6: Master Data', 'Tra cứu thông tin thuê bao (US-16)'],
    moduleCode: 'M6' as ModuleCode,
    title: 'M6: Tra cứu danh bạ thuê bao'
  },
  MASTER_DATA_PRODUCTS_SERVICES: {
    path: 'master-data/products-services',
    fullPath: '/master-data/products-services',
    resource: 'MasterData' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Danh mục Sản phẩm/Dịch vụ (US-17)',
    breadcrumbs: ['M6: Master Data', 'Danh mục Sản phẩm/Dịch vụ (US-17)'],
    moduleCode: 'M6' as ModuleCode,
    title: 'M6: Danh mục sản phẩm & dịch vụ'
  },

  // ==========================================================================
  // [PHÂN HỆ M7] - QUẢN TRỊ HỆ THỐNG
  // ==========================================================================
  ADMIN: {
    path: 'admin',
    fullPath: '/admin/organization',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cơ cấu tổ chức & Phòng ban (US-18)',
    breadcrumbs: ['M7: Quản trị Hệ thống', 'Cơ cấu tổ chức & Phòng ban (US-18)'],
    moduleCode: 'M7' as ModuleCode,
    title: 'M7: Cơ cấu tổ chức & Phòng ban'
  },
  ADMIN_USERS: {
    path: 'admin/users',
    fullPath: '/admin/users',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Quản lý danh sách Người dùng',
    breadcrumbs: ['M7: Quản trị Hệ thống', 'Quản lý danh sách Người dùng'],
    moduleCode: 'M7' as ModuleCode,
    title: 'M7: Quản trị Người dùng'
  },
  ADMIN_ROLES_PERMISSIONS: {
    path: 'admin/roles-permissions',
    fullPath: '/admin/roles-permissions',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Phân quyền & Vai trò (FR-38)',
    breadcrumbs: ['M7: Quản trị Hệ thống', 'Phân quyền & Vai trò (FR-38)'],
    moduleCode: 'M7' as ModuleCode,
    title: 'M7: Phân vai & Ma trận quyền RBAC'
  },
  SYSTEM_ADMIN: {
    path: 'system-admin',
    fullPath: '/admin/organization',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cơ cấu tổ chức & Phòng ban (Alias)',
    breadcrumbs: ['M7: Quản trị Hệ thống', 'Cơ cấu tổ chức & Phòng ban (US-18)'],
    moduleCode: 'M7' as ModuleCode,
    title: 'M7: Cơ cấu tổ chức & Phòng ban'
  },
  FORBIDDEN: {
    path: 'forbidden',
    fullPath: '/forbidden',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Truy cập bị từ chối (403 Forbidden)',
    breadcrumbs: ['Hệ thống', '403 Forbidden'],
    moduleCode: 'M7' as ModuleCode,
    title: '403 Forbidden'
  }
} as const;

/**
 * Danh sách RouteRbacConfig tập trung cho toàn bộ hệ thống
 */
export const SYSTEM_ROUTE_RBAC_MAP: RouteRbacConfig[] = Object.values(SYSTEM_ROUTES).map(route => ({
  path: route.fullPath,
  fullPath: route.fullPath,
  resource: route.resource,
  action: route.action,
  label: route.label,
  breadcrumbs: [...route.breadcrumbs],
  moduleCode: route.moduleCode,
  title: route.title
}));

/**
 * Tra cứu thông tin RBAC và Breadcrumbs tập trung theo URL hiện tại.
 */
export function findRouteRbacConfig(targetUrl: string): RouteRbacConfig | null {
  if (!targetUrl) return null;

  // Làm sạch URL: bỏ query param, hash, trailing slash
  const cleanPath = targetUrl.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanRelative = cleanPath.replace(/^\//, '');

  // 1. Khớp chính xác theo fullPath hoặc path tương đối
  const exactMatch = SYSTEM_ROUTE_RBAC_MAP.find(r =>
    r.path === cleanPath ||
    r.fullPath === cleanPath ||
    (r.path && r.path.replace(/^\//, '') === cleanRelative)
  );
  if (exactMatch) return exactMatch;

  // 2. Khớp tiền tố (prefix) cho các sub-routes
  const prefixMatch = SYSTEM_ROUTE_RBAC_MAP.find(r =>
    (r.fullPath && cleanPath.startsWith(r.fullPath)) ||
    (r.path && cleanPath.startsWith(r.path))
  );
  if (prefixMatch) return prefixMatch;

  return null;
}
