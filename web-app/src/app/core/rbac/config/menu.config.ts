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
    key: 'process_management',
    label: 'Quản lý Quy trình',
    icon: 'partition',
    requiredResource: 'Template',
    requiredPermission: 'view',
    children: [
      {
        key: 'templates_list',
        label: 'Danh sách Template',
        path: '/process/templates-list',
        icon: 'table',
        requiredResource: 'Template',
        requiredPermission: 'view'
      },
      {
        key: 'action_library',
        label: 'Thư viện Action',
        path: '/process/action-library',
        icon: 'appstore',
        requiredResource: 'ActionLibrary',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M2: Quản lý Flow Instance
  // ==========================================================================
  {
    key: 'flow_instances_management',
    label: 'Quản lý Flow Instance',
    icon: 'branches',
    requiredResource: 'Instance',
    requiredPermission: 'view',
    children: [
      {
        key: 'realtime_monitor',
        label: 'Giám sát tiến trình thời gian thực',
        path: '/instances/monitor',
        icon: 'fund',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      },
      {
        key: 'execution_history',
        label: 'Lịch sử thực thi & Audit',
        path: '/instances/history',
        icon: 'history',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      },
      {
        key: 'immutable_logs',
        label: 'Nhật ký Log hệ thống',
        path: '/instances/logs',
        icon: 'file-text',
        requiredResource: 'Instance',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M3: Quản lý Task
  // ==========================================================================
  {
    key: 'task_management',
    label: 'Quản lý Task',
    icon: 'check-square',
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
        key: 'my_tasks',
        label: 'Task của tôi (My Tasks)',
        path: '/tasks/my-tasks',
        icon: 'user-switch',
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
        key: 'process_task',
        label: 'Xử lý & Phê duyệt Task',
        path: '/tasks/process',
        icon: 'form',
        requiredResource: 'Task',
        requiredPermission: 'view'
      },
      {
        key: 'reference_data',
        label: 'Master Data tham chiếu (View-only)',
        path: '/tasks/reference',
        icon: 'database',
        requiredResource: 'Task',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M4: Báo cáo & Dashboard
  // ==========================================================================
  {
    key: 'reports_dashboards',
    label: 'Báo cáo & Dashboard',
    icon: 'dashboard',
    requiredResource: 'Report',
    requiredPermission: 'view',
    children: [
      {
        key: 'overview_dashboard',
        label: 'Dashboard tổng quan',
        path: '/reports/dashboard',
        icon: 'pie-chart',
        requiredResource: 'Dashboard',
        requiredPermission: 'view'
      },
      {
        key: 'sla_process_report',
        label: 'Báo cáo SLA & Quy trình',
        path: '/reports/sla-process',
        icon: 'bar-chart',
        requiredResource: 'Report',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M5: Cấu hình Vận hành (Admin Console)
  // ==========================================================================
  {
    key: 'operation_settings',
    label: 'Cấu hình Vận hành',
    icon: 'setting',
    requiredResource: 'Integration',
    requiredPermission: 'view',
    children: [
      {
        key: 'sla_escalation',
        label: 'Cấu hình SLA & Leo thang',
        path: '/settings/sla-escalation',
        icon: 'alert',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'auto_assignment',
        label: 'Phân việc tự động',
        path: '/settings/auto-assignment',
        icon: 'sync',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'inbound_channels',
        label: 'Kênh tiếp nhận (Zalo/SMS/Webhook)',
        path: '/settings/inbound-channels',
        icon: 'api',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      },
      {
        key: 'notification_templates',
        label: 'Mẫu Email & Thông báo',
        path: '/settings/notification-templates',
        icon: 'mail',
        requiredResource: 'Integration',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M6: Master Data (Tham chiếu dữ liệu)
  // ==========================================================================
  {
    key: 'master_data',
    label: 'Master Data',
    icon: 'folder-open',
    requiredResource: 'MasterData',
    requiredPermission: 'view',
    children: [
      {
        key: 'subscribers',
        label: 'Tra cứu thông tin thuê bao',
        path: '/master-data/subscribers',
        icon: 'idcard',
        requiredResource: 'MasterData',
        requiredPermission: 'view'
      },
      {
        key: 'products_services',
        label: 'Danh mục Sản phẩm & Dịch vụ',
        path: '/master-data/products-services',
        icon: 'shopping-cart',
        requiredResource: 'MasterData',
        requiredPermission: 'view'
      }
    ]
  },

  // ==========================================================================
  // M7: Quản trị Hệ thống
  // ==========================================================================
  {
    key: 'system_admin',
    label: 'Quản trị Hệ thống',
    icon: 'safety-certificate',
    requiredResource: 'SystemAdmin',
    requiredPermission: 'view',
    children: [
      {
        key: 'organization',
        label: 'Cơ cấu tổ chức & Phòng ban',
        path: '/admin/organization',
        icon: 'team',
        requiredResource: 'SystemAdmin',
        requiredPermission: 'view'
      },
      {
        key: 'users_management',
        label: 'Quản lý danh sách Người dùng',
        path: '/admin/users',
        icon: 'user',
        requiredResource: 'SystemAdmin',
        requiredPermission: 'view'
      },
      {
        key: 'roles_permissions',
        label: 'Phân quyền & Vai trò',
        path: '/admin/roles-permissions',
        icon: 'lock',
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
// ============================================================================
export const ROLE_DEFAULT_LANDING_PAGES: Record<UserRole, string> = {
  AGENT: '/tasks/my-tasks',
  SUPERVISOR: '/reports/dashboard',
  ADMIN: '/process/templates-list',
  SUPER_ADMIN: '/process/templates-list',
  CUSTOM: '/tasks/my-tasks'
};

// ============================================================================
// MA TRẬN ROUTING & RBAC TẬP TRUNG (CENTRALIZED ROUTE RBAC MAP)
// ============================================================================

export const SYSTEM_ROUTES = {
  // ==========================================================================
  // [PHÂN HỆ M1] - QUẢN LÝ QUY TRÌNH
  // ==========================================================================
  GRAPH: {
    path: 'process/graph',
    fullPath: '/process/graph',
    resource: 'Template' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Canvas Builder',
    breadcrumbs: ['Quản lý Quy trình', 'Canvas Builder'],
    moduleCode: 'M1' as ModuleCode,
    title: 'BPMN Canvas Builder'
  },
  ACTION_LIBRARY: {
    path: 'process/action-library',
    fullPath: '/process/action-library',
    resource: 'ActionLibrary' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Thư viện Action dùng chung',
    breadcrumbs: ['Quản lý Quy trình', 'Thư viện Action dùng chung'],
    moduleCode: 'M1' as ModuleCode,
    title: 'Thư viện Action dùng chung'
  },
  TEMPLATES_LIST: {
    path: 'process/templates-list',
    fullPath: '/process/templates-list',
    resource: 'Template' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Danh sách Template',
    breadcrumbs: ['Quản lý Quy trình', 'Danh sách Template'],
    moduleCode: 'M1' as ModuleCode,
    title: 'Danh sách Quy trình'
  },
  TEMPLATES_MANAGEMENT: {
    path: 'process/templates-list',
    fullPath: '/process/templates-list',
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
  INSTANCES_MONITOR: {
    path: 'instances/monitor',
    fullPath: '/instances/monitor',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Giám sát tiến trình thời gian thực',
    breadcrumbs: ['Quản lý Flow Instance', 'Giám sát tiến trình thời gian thực'],
    moduleCode: 'M2' as ModuleCode,
    title: 'Giám sát tiến trình thời gian thực'
  },
  INSTANCES_HISTORY: {
    path: 'instances/history',
    fullPath: '/instances/history',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Lịch sử thực thi & Audit',
    breadcrumbs: ['Quản lý Flow Instance', 'Lịch sử thực thi & Audit'],
    moduleCode: 'M2' as ModuleCode,
    title: 'Lịch sử thực thi & Audit Trail'
  },
  INSTANCES_LOGS: {
    path: 'instances/logs',
    fullPath: '/instances/logs',
    resource: 'Instance' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Nhật ký Log hệ thống',
    breadcrumbs: ['Quản lý Flow Instance', 'Nhật ký Log hệ thống'],
    moduleCode: 'M2' as ModuleCode,
    title: 'Nhật ký Log hệ thống'
  },

  // ==========================================================================
  // [PHÂN HỆ M3] - QUẢN LÝ TASK
  // ==========================================================================
  TASKS_MY_TASKS: {
    path: 'tasks/my-tasks',
    fullPath: '/tasks/my-tasks',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Task của tôi',
    breadcrumbs: ['Quản lý Task', 'Task của tôi'],
    moduleCode: 'M3' as ModuleCode,
    title: 'Task của tôi'
  },
  TASKS_PROCESS: {
    path: 'tasks/process',
    fullPath: '/tasks/process',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Xử lý & Phê duyệt Task',
    breadcrumbs: ['Quản lý Task', 'Xử lý & Phê duyệt Task'],
    moduleCode: 'M3' as ModuleCode,
    title: 'Xử lý & Phê duyệt Task'
  },
  TASKS_REFERENCE: {
    path: 'tasks/reference',
    fullPath: '/tasks/reference',
    resource: 'Task' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Master Data tham chiếu (View-only)',
    breadcrumbs: ['Quản lý Task', 'Master Data tham chiếu (View-only)'],
    moduleCode: 'M3' as ModuleCode,
    title: 'Master Data tham chiếu'
  },

  // ==========================================================================
  // [PHÂN HỆ M4] - BÁO CÁO & DASHBOARD
  // ==========================================================================
  REPORTS_DASHBOARD: {
    path: 'reports/dashboard',
    fullPath: '/reports/dashboard',
    resource: 'Dashboard' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Dashboard tổng quan',
    breadcrumbs: ['Báo cáo & Dashboard', 'Dashboard tổng quan'],
    moduleCode: 'M4' as ModuleCode,
    title: 'Dashboard SLA & Vận hành'
  },
  REPORTS: {
    path: 'reports/dashboard',
    fullPath: '/reports/dashboard',
    resource: 'Dashboard' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Dashboard tổng quan',
    breadcrumbs: ['Báo cáo & Dashboard', 'Dashboard tổng quan'],
    moduleCode: 'M4' as ModuleCode,
    title: 'Dashboard SLA & Vận hành'
  },
  REPORTS_SLA_PROCESS: {
    path: 'reports/sla-process',
    fullPath: '/reports/sla-process',
    resource: 'Report' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Báo cáo SLA & Quy trình',
    breadcrumbs: ['Báo cáo & Dashboard', 'Báo cáo SLA & Quy trình'],
    moduleCode: 'M4' as ModuleCode,
    title: 'Báo cáo chi tiết SLA theo Quy trình'
  },

  // ==========================================================================
  // [PHÂN HỆ M5] - CẤU HÌNH VẬN HÀNH
  // ==========================================================================
  SETTINGS_SLA_ESCALATION: {
    path: 'settings/sla-escalation',
    fullPath: '/settings/sla-escalation',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cấu hình SLA & Leo thang',
    breadcrumbs: ['Cấu hình Vận hành', 'Cấu hình SLA & Leo thang'],
    moduleCode: 'M5' as ModuleCode,
    title: 'Cấu hình SLA Escalation'
  },
  SETTINGS: {
    path: 'settings/sla-escalation',
    fullPath: '/settings/sla-escalation',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cấu hình SLA & Leo thang',
    breadcrumbs: ['Cấu hình Vận hành', 'Cấu hình SLA & Leo thang'],
    moduleCode: 'M5' as ModuleCode,
    title: 'Cấu hình SLA Escalation'
  },
  SETTINGS_AUTO_ASSIGNMENT: {
    path: 'settings/auto-assignment',
    fullPath: '/settings/auto-assignment',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Phân việc tự động',
    breadcrumbs: ['Cấu hình Vận hành', 'Phân việc tự động'],
    moduleCode: 'M5' as ModuleCode,
    title: 'Quy tắc chia Task tự động'
  },
  SETTINGS_INBOUND_CHANNELS: {
    path: 'settings/inbound-channels',
    fullPath: '/settings/inbound-channels',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Kênh tiếp nhận (Zalo/SMS/Webhook)',
    breadcrumbs: ['Cấu hình Vận hành', 'Kênh tiếp nhận (Zalo/SMS/Webhook)'],
    moduleCode: 'M5' as ModuleCode,
    title: 'Kênh tiếp nhận Webhook & API'
  },
  SETTINGS_NOTIFICATION_TEMPLATES: {
    path: 'settings/notification-templates',
    fullPath: '/settings/notification-templates',
    resource: 'Integration' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Mẫu Email & Thông báo',
    breadcrumbs: ['Cấu hình Vận hành', 'Mẫu Email & Thông báo'],
    moduleCode: 'M5' as ModuleCode,
    title: 'Mẫu tin thông báo đa kênh'
  },

  // ==========================================================================
  // [PHÂN HỆ M6] - DỮ LIỆU DANH MỤC (MASTER DATA)
  // ==========================================================================
  MASTER_DATA_SUBSCRIBERS: {
    path: 'master-data/subscribers',
    fullPath: '/master-data/subscribers',
    resource: 'MasterData' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Tra cứu thông tin thuê bao',
    breadcrumbs: ['Master Data', 'Tra cứu thông tin thuê bao'],
    moduleCode: 'M6' as ModuleCode,
    title: 'Tra cứu danh bạ thuê bao'
  },
  MASTER_DATA: {
    path: 'master-data/subscribers',
    fullPath: '/master-data/subscribers',
    resource: 'MasterData' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Tra cứu thông tin thuê bao',
    breadcrumbs: ['Master Data', 'Tra cứu thông tin thuê bao'],
    moduleCode: 'M6' as ModuleCode,
    title: 'Tra cứu danh bạ thuê bao'
  },
  MASTER_DATA_PRODUCTS_SERVICES: {
    path: 'master-data/products-services',
    fullPath: '/master-data/products-services',
    resource: 'MasterData' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Danh mục Sản phẩm & Dịch vụ',
    breadcrumbs: ['Master Data', 'Danh mục Sản phẩm & Dịch vụ'],
    moduleCode: 'M6' as ModuleCode,
    title: 'Danh mục sản phẩm & dịch vụ'
  },

  // ==========================================================================
  // [PHÂN HỆ M7] - QUẢN TRỊ HỆ THỐNG
  // ==========================================================================
  ADMIN_ORGANIZATION: {
    path: 'admin/organization',
    fullPath: '/admin/organization',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cơ cấu tổ chức & Phòng ban',
    breadcrumbs: ['Quản trị Hệ thống', 'Cơ cấu tổ chức & Phòng ban'],
    moduleCode: 'M7' as ModuleCode,
    title: 'Cơ cấu tổ chức & Phòng ban'
  },
  ADMIN: {
    path: 'admin/organization',
    fullPath: '/admin/organization',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cơ cấu tổ chức & Phòng ban',
    breadcrumbs: ['Quản trị Hệ thống', 'Cơ cấu tổ chức & Phòng ban'],
    moduleCode: 'M7' as ModuleCode,
    title: 'Cơ cấu tổ chức & Phòng ban'
  },
  ADMIN_USERS: {
    path: 'admin/users',
    fullPath: '/admin/users',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Quản lý danh sách Người dùng',
    breadcrumbs: ['Quản trị Hệ thống', 'Quản lý danh sách Người dùng'],
    moduleCode: 'M7' as ModuleCode,
    title: 'Quản trị Người dùng'
  },
  ADMIN_ROLES_PERMISSIONS: {
    path: 'admin/roles-permissions',
    fullPath: '/admin/roles-permissions',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Phân quyền & Vai trò',
    breadcrumbs: ['Quản trị Hệ thống', 'Phân quyền & Vai trò'],
    moduleCode: 'M7' as ModuleCode,
    title: 'Phân vai & Ma trận quyền RBAC'
  },
  SYSTEM_ADMIN: {
    path: 'admin/organization',
    fullPath: '/admin/organization',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Cơ cấu tổ chức & Phòng ban',
    breadcrumbs: ['Quản trị Hệ thống', 'Cơ cấu tổ chức & Phòng ban'],
    moduleCode: 'M7' as ModuleCode,
    title: 'Cơ cấu tổ chức & Phòng ban'
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
  },
  NOT_FOUND: {
    path: 'not-found',
    fullPath: '/not-found',
    resource: 'SystemAdmin' as ResourceType,
    action: 'view' as ActionPermission,
    label: 'Không tìm thấy trang (404 Not Found)',
    breadcrumbs: ['Hệ thống', '404 Not Found'],
    moduleCode: 'M7' as ModuleCode,
    title: '404 Not Found'
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
