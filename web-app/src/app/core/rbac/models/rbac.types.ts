/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - DYNAMIC RBAC MENU SYSTEM
 * File: rbac.types.ts
 * Description: Định nghĩa toàn bộ Schema, Types, Enums chuẩn hóa cho RBAC,
 *              Resource Scope, Function Permissions, Menu Navigation và Metadata.
 * ============================================================================
 */

// 1. Danh sách Thao tác chức năng (Function Permissions)
export type ActionPermission = 'view' | 'edit' | 'delete' | 'create' | 'execute';

// 2. Danh sách Tài nguyên nghiệp vụ chuẩn hóa (Business Resources)
export type ResourceType =
  | 'Template'        // M1: Quy trình & Canvas Builder
  | 'ActionLibrary'   // M1: Thư viện Action dùng chung
  | 'Instance'        // M2: Flow Instance & Giám sát luồng
  | 'Task'            // M3: Quản lý & Xử lý Task
  | 'Report'          // M4: Báo cáo chi tiết & SLA
  | 'Dashboard'       // M4: Dashboard tổng quan
  | 'Integration'     // M5: Cấu hình vận hành (SLA, Kênh, Mẫu)
  | 'Setting'         // M5 Alias
  | 'MasterData'      // M6: Tham chiếu dữ liệu (Thuê bao, Sản phẩm)
  | 'SystemAdmin'     // M7: Quản trị Hệ thống (User, Org, Role)
  | 'Admin';          // M7 Alias

// 3. Phạm vi Dữ liệu (Data Scope)
export type DataScope = 'All' | 'Organization' | 'Group' | 'Own';

// 4. Mã Phân hệ Cố định (Module Codes M1 - M7)
export type ModuleCode = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7';

// 5. Cấu trúc Quyền hạn của người dùng trên một Resource
export interface UserPermission {
  resource: ResourceType;
  actions: ActionPermission[];
  scope: DataScope;
}

// 6. Vai trò của người dùng trong hệ thống IPCC 2.0
export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'SUPERVISOR' | 'AGENT' | 'CUSTOM';

// 6b. Cấu hình RBAC tập trung cho mỗi Route
export interface RouteRbacConfig {
  path: string;
  fullPath?: string;
  resource: ResourceType;
  action: ActionPermission;
  label: string;
  breadcrumbs: string[] | readonly string[];
  moduleCode: ModuleCode;
  title: string;
}

// 7. Thông tin Phiên làm việc Người dùng (User Session)
export interface UserSession {
  userId: string;
  username: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  roleTitle: string;
  permissions: UserPermission[];
  department?: string;
}

// 8. Huy hiệu trạng thái (Badge) cho Menu Item (VD: Task chờ xử lý, SLA quá hạn)
export interface MenuBadge {
  count?: number;
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  isPulse?: boolean; // Hiệu ứng nhấp nháy cho SLA quá hạn
  tooltip?: string;
}

// 9. Cấu trúc Route Metadata gắn liền với Router Guard
export interface RouteMeta {
  title: string;
  moduleCode: ModuleCode;
  requiredResource: ResourceType;
  requiredPermission: ActionPermission; // Mặc định là 'view' để được hiển thị/truy cập
  requiredScope?: DataScope;
  breadcrumb?: string[];
  hideInMenu?: boolean;
}

// 10. Cấu trúc Đối tượng Menu Item chuẩn hóa (Chuẩn Ant Design / Enterprise Navigation)
export interface MenuItem {
  key: string;                          // Unique Key nhận diện menu (VD: 'templates_list')
  label: string;                        // Tên hiển thị tiếng Việt chuẩn hóa
  path?: string;                        // Đường dẫn URL router (Leaf node bắt buộc có path)
  icon?: string;                        // Tên icon hoặc SVG định danh
  requiredResource: ResourceType;       // Tài nguyên yêu cầu kiểm tra quyền
  requiredPermission?: ActionPermission;// Mặc định là 'view'
  requiredScope?: DataScope;            // Phạm vi dữ liệu yêu cầu tối thiểu (optional)
  badge?: MenuBadge;                    // Huy hiệu hiển thị số lượng (VD: Task count)
  badgeWarning?: MenuBadge;             // Huy hiệu phụ cảnh báo nguy cấp (VD: SLA overdue)
  children?: MenuItem[];                // Danh sách menu con lồng nhau
  disabled?: boolean;                   // Khóa tạm thời (nếu có)
  externalLink?: boolean;               // Mở tab mới ngoài hệ thống
  isDivider?: boolean;                  // Vạch phân cách trực quan
}

// 11. Trạng thái Navigation Sidebar State
export interface SidebarNavState {
  collapsed: boolean;
  activeKey: string;
  activePath: string;
  openKeys: string[];
  breadcrumbs: string[];
}
