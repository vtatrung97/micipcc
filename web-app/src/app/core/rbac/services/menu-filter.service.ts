/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - DYNAMIC RBAC MENU SYSTEM
 * File: menu-filter.service.ts
 * Description: Thuật toán lọc đệ quy Menu động (Recursive Dynamic Tree Filter)
 *              và React Hook / Angular Service quản lý trạng thái RBAC Navigation.
 * ============================================================================
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ActionPermission,
  MenuItem,
  ResourceType,
  SidebarNavState,
  UserPermission,
  UserRole,
  UserSession
} from '../models/rbac.types';
import { PRESET_USERS, SYSTEM_MENU_CONFIG } from '../config/menu.config';

// ============================================================================
// 1. THUẬT TOÁN LỌC MENU ĐỆ QUY (UNIVERSAL PURE FUNCTION)
//    Hoạt động 100% độc lập, tái sử dụng được trong React, Vue, Angular, Vanilla JS
// ============================================================================

/**
 * Kiểm tra xem người dùng có quyền cụ thể trên một Resource hay không
 */
export function hasResourcePermission(
  userPermissions: UserPermission[],
  resource: ResourceType,
  action: ActionPermission = 'view'
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  const match = userPermissions.find(p => p.resource === resource);
  if (!match) {
    return false;
  }
  return match.actions.includes(action);
}

/**
 * Lọc đệ quy toàn bộ cây Menu dựa trên ma trận User Permissions:
 * - Chỉ giữ lại các Leaf Menu nếu có quyền 'view' trên Resource tương ứng.
 * - Đối với Menu cha (có children): Nếu sau khi lọc, danh sách con rỗng thì ẨN CẢ MENU CHA.
 * - Đảm bảo tính Immutable (không làm biến dạng danh mục gốc `SYSTEM_MENU_CONFIG`).
 */
export function filterAuthorizedMenu(
  menuTree: MenuItem[],
  userPermissions: UserPermission[]
): MenuItem[] {
  if (!menuTree || !Array.isArray(menuTree)) {
    return [];
  }

  const result: MenuItem[] = [];

  for (const item of menuTree) {
    // 1. Nếu item có children -> Duyệt đệ quy trước
    if (item.children && item.children.length > 0) {
      const authorizedChildren = filterAuthorizedMenu(item.children, userPermissions);

      // Nếu có ít nhất 1 menu con thỏa mãn quyền -> Giữ lại menu cha này
      if (authorizedChildren.length > 0) {
        result.push({
          ...item,
          children: authorizedChildren
        });
      }
    } else {
      // 2. Nếu là Leaf Item -> Kiểm tra quyền trực tiếp
      const requiredAction = item.requiredPermission || 'view';
      const isAllowed = hasResourcePermission(userPermissions, item.requiredResource, requiredAction);

      if (isAllowed) {
        result.push({ ...item });
      }
    }
  }

  return result;
}

/**
 * Tìm kiếm đường đi (Breadcrumb) và MenuItem tương ứng từ URL Path
 */
export function findMenuByPath(
  menuTree: MenuItem[],
  targetPath: string,
  ancestors: string[] = []
): { item: MenuItem | null; breadcrumbs: string[] } {
  for (const item of menuTree) {
    const currentBreadcrumbs = [...ancestors, item.label];

    if (item.path === targetPath) {
      return { item, breadcrumbs: currentBreadcrumbs };
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuByPath(item.children, targetPath, currentBreadcrumbs);
      if (found.item) {
        return found;
      }
    }
  }

  return { item: null, breadcrumbs: [] };
}

/**
 * Tìm kiếm cấu hình Menu gốc từ toàn bộ `SYSTEM_MENU_CONFIG` (kể cả menu bị ẩn)
 * Dùng cho Route Guard để đối chiếu quyền hạn yêu cầu của một URL.
 */
export function findConfigByPath(
  menuTree: MenuItem[],
  targetPath: string
): MenuItem | null {
  for (const item of menuTree) {
    if (item.path === targetPath) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findConfigByPath(item.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Kiểm tra xem user hiện tại có được phép truy cập một URL cụ thể hay không
 */
export function canAccessPath(
  targetPath: string,
  userPermissions: UserPermission[],
  menuConfig: MenuItem[] = SYSTEM_MENU_CONFIG
): { allowed: boolean; reason?: string; requiredResource?: ResourceType } {
  // Ngoại lệ: Trang 403, 404, login luôn được phép
  if (['/forbidden', '/403', '/login', '/'].includes(targetPath)) {
    return { allowed: true };
  }

  const matched = findConfigByPath(menuConfig, targetPath);
  if (!matched) {
    // Nếu path không nằm trong danh mục định nghĩa, cho phép route thông thường hoặc 404
    return { allowed: true };
  }

  const requiredAction = matched.requiredPermission || 'view';
  const hasAccess = hasResourcePermission(userPermissions, matched.requiredResource, requiredAction);

  if (!hasAccess) {
    return {
      allowed: false,
      reason: `Bạn không có quyền '${requiredAction}' trên tài nguyên '${matched.requiredResource}'`,
      requiredResource: matched.requiredResource
    };
  }

  return { allowed: true };
}

// ============================================================================
// 2. REACT HOOK: useAuthorizedMenu (Universal Export cho React/Next.js)
//    Thỏa mãn đầy đủ yêu cầu mục 3.2 trong đề bài
// ============================================================================
export function useAuthorizedMenu(userPermissions: UserPermission[]): {
  authorizedMenu: MenuItem[];
  canAccess: (path: string) => boolean;
  getBreadcrumbs: (path: string) => string[];
} {
  const authorizedMenu = filterAuthorizedMenu(SYSTEM_MENU_CONFIG, userPermissions);

  const canAccess = (path: string) => {
    return canAccessPath(path, userPermissions).allowed;
  };

  const getBreadcrumbs = (path: string) => {
    return findMenuByPath(authorizedMenu, path).breadcrumbs;
  };

  return {
    authorizedMenu,
    canAccess,
    getBreadcrumbs
  };
}

// ============================================================================
// 3. ANGULAR SERVICE: RbacMenuService
//    Quản lý luồng Reactive State (RxJS) cho toàn bộ ứng dụng Angular hiện tại
// ============================================================================
@Injectable({
  providedIn: 'root'
})
export class RbacMenuService {
  // Trạng thái phiên người dùng hiện tại
  private currentUserSubject = new BehaviorSubject<UserSession>(PRESET_USERS.ADMIN);
  public currentUser$: Observable<UserSession> = this.currentUserSubject.asObservable();

  // Danh mục Menu đã lọc theo quyền của user hiện tại
  private authorizedMenuSubject = new BehaviorSubject<MenuItem[]>(
    filterAuthorizedMenu(SYSTEM_MENU_CONFIG, PRESET_USERS.ADMIN.permissions)
  );
  public authorizedMenu$: Observable<MenuItem[]> = this.authorizedMenuSubject.asObservable();

  // Trạng thái thu gọn/mở rộng Sidebar & Active path
  private navStateSubject = new BehaviorSubject<SidebarNavState>({
    collapsed: false,
    activeKey: 'templates_list',
    activePath: '/process/templates-list',
    openKeys: ['process_management'],
    breadcrumbs: ['Quản lý Quy trình', 'Danh sách Template']
  });
  public navState$: Observable<SidebarNavState> = this.navStateSubject.asObservable();

  // Live Task Counts (Dành cho Badge M3)
  private taskStatsSubject = new BehaviorSubject<{ pending: number; overdue: number }>({
    pending: 14,
    overdue: 3
  });
  public taskStats$ = this.taskStatsSubject.asObservable();

  constructor() {
    this.refreshMenu();
  }

  /**
   * Lấy UserSession hiện tại
   */
  public getCurrentUser(): UserSession {
    return this.currentUserSubject.getValue();
  }

  /**
   * Đổi Role trực tiếp (Giả lập Admin, Supervisor, Agent để kiểm thử Realtime)
   */
  public switchRole(role: UserRole): void {
    const targetUser = PRESET_USERS[role];
    if (targetUser) {
      this.currentUserSubject.next({ ...targetUser });
      this.refreshMenu();
    }
  }

  /**
   * Cập nhật danh sách Permissions trực tiếp (Sandbox mode)
   */
  public updatePermissions(permissions: UserPermission[]): void {
    const user = this.currentUserSubject.getValue();
    this.currentUserSubject.next({
      ...user,
      permissions
    });
    this.refreshMenu();
  }

  /**
   * Tính toán lại cây menu dựa trên quyền mới nhất
   */
  public refreshMenu(): void {
    const user = this.currentUserSubject.getValue();
    const stats = this.taskStatsSubject.getValue();

    // Clone cấu hình gốc và gắn badge realtime
    const dynamicConfig = JSON.parse(JSON.stringify(SYSTEM_MENU_CONFIG)) as MenuItem[];
    this.attachBadges(dynamicConfig, stats.pending, stats.overdue);

    const filtered = filterAuthorizedMenu(dynamicConfig, user.permissions);
    this.authorizedMenuSubject.next(filtered);

    // Cập nhật lại breadcrumb theo active path hiện tại
    const currentState = this.navStateSubject.getValue();
    const { breadcrumbs } = findMenuByPath(filtered, currentState.activePath);
    this.navStateSubject.next({
      ...currentState,
      breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : ['Hệ thống Flow IPCC 2.0']
    });
  }

  /**
   * Bật/tắt trạng thái thu gọn Sidebar
   */
  public toggleSidebar(): void {
    const current = this.navStateSubject.getValue();
    this.navStateSubject.next({
      ...current,
      collapsed: !current.collapsed
    });
  }

  /**
   * Đặt trạng thái Sidebar
   */
  public setCollapsed(collapsed: boolean): void {
    const current = this.navStateSubject.getValue();
    this.navStateSubject.next({
      ...current,
      collapsed
    });
  }

  /**
   * Cập nhật URL đường dẫn đang active và tự động mở Submenu cha
   */
  public setActivePath(path: string): void {
    const current = this.navStateSubject.getValue();
    const menuTree = this.authorizedMenuSubject.getValue();
    const { item, breadcrumbs } = findMenuByPath(menuTree, path);

    const openKeys = [...current.openKeys];
    if (item) {
      for (const parent of menuTree) {
        if (parent.children?.some(c => c.key === item.key || c.path === path)) {
          if (!openKeys.includes(parent.key)) {
            openKeys.push(parent.key);
          }
          break;
        }
      }
    }

    this.navStateSubject.next({
      ...current,
      activePath: path,
      activeKey: item ? item.key : '',
      breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : ['Hệ thống Flow IPCC 2.0'],
      openKeys
    });
  }

  /**
   * Đóng/mở Submenu cha (Accordion mode)
   */
  public toggleSubmenu(key: string): void {
    const current = this.navStateSubject.getValue();
    const isOpen = current.openKeys.includes(key);
    const newOpenKeys = isOpen
      ? current.openKeys.filter((k: string) => k !== key)
      : [...current.openKeys, key];

    this.navStateSubject.next({
      ...current,
      openKeys: newOpenKeys
    });
  }

  /**
   * Cập nhật số lượng Badge M3 (Mô phỏng realtime SSE / WebSocket)
   */
  public updateTaskBadges(pending: number, overdue: number): void {
    this.taskStatsSubject.next({ pending, overdue });
    this.refreshMenu();
  }

  /**
   * Kiểm tra quyền truy cập route
   */
  public canAccess(path: string): { allowed: boolean; reason?: string; requiredResource?: ResourceType } {
    const user = this.currentUserSubject.getValue();
    return canAccessPath(path, user.permissions);
  }

  /**
   * Gắn Badge động vào mục M3
   */
  private attachBadges(menu: MenuItem[], pending: number, overdue: number): void {
    for (const item of menu) {
      if (item.key === 'task_management' || item.key === 'my_tasks') {
        item.badge = {
          count: pending,
          variant: 'primary',
          tooltip: `${pending} Task đang chờ xử lý`
        };
        item.badgeWarning = overdue > 0 ? {
          count: overdue,
          variant: 'danger',
          isPulse: true,
          tooltip: `CẢNH BÁO: ${overdue} Task đã quá hạn SLA!`
        } : undefined;
      }
      if (item.children) {
        this.attachBadges(item.children, pending, overdue);
      }
    }
  }

  private getParentKeyForModule(mod: string): string {
    switch (mod) {
      case 'M1': return 'process_management';
      case 'M2': return 'flow_instances';
      case 'M3': return 'task_management';
      case 'M4': return 'reports_dashboards';
      case 'M5': return 'operation_settings';
      case 'M6': return 'master_data';
      case 'M7': return 'system_admin';
      default: return '';
    }
  }
}
