import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserRole, UserSession, ResourceType, ActionPermission } from '../models/rbac.types';
import { PRESET_USERS, findRouteRbacConfig, ROLE_DEFAULT_LANDING_PAGES } from '../config/menu.config';
import { RbacMenuService } from './menu-filter.service';

/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - ENTERPRISE IN-MEMORY RBAC SERVICE
 * ============================================================================
 * Quản lý thẩm quyền theo kiến trúc Cache-in-Memory:
 * 1. userPermissions: Map<string, Set<string>> lưu trữ trực tiếp trên RAM.
 * 2. restorePermissionsFromStorage(): Chỉ đọc Storage một lần duy nhất khi khởi tạo.
 * 3. hasPermission(resource, action): O(1) tra cứu trên RAM; ADMIN & SUPER_ADMIN bypass.
 * 4. Tự động tính toán và phát Breadcrumbs theo URL Router.
 * 5. Quản lý Trang mặc định theo Role (US-18, REQ-04) và Tùy chọn người dùng (US-08, US-09).
 * ============================================================================
 */
@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private readonly STORAGE_KEY = 'ipcc_flow_user_role';
  private readonly CUSTOM_LANDING_KEY_PREFIX = 'ipcc_custom_landing_';

  // In-memory state: Role hiện tại
  private currentUserRoleSubject = new BehaviorSubject<UserRole>('ADMIN');
  public currentUserRole$: Observable<UserRole> = this.currentUserRoleSubject.asObservable();

  // In-memory state: User Session hiện tại
  private currentUserSubject = new BehaviorSubject<UserSession>(PRESET_USERS.ADMIN);
  public currentUser$: Observable<UserSession> = this.currentUserSubject.asObservable();

  // In-memory state: Trang mặc định tùy chỉnh của user (US-08, US-09)
  private customLandingSubject = new BehaviorSubject<string | null>(null);
  public customLanding$: Observable<string | null> = this.customLandingSubject.asObservable();

  // In-memory Cache: Resource -> Set of actions (vd: 'Template' -> Set(['view', 'create', 'edit']))
  private userPermissions = new Map<string, Set<string>>();

  // In-memory state: Dynamic Breadcrumbs phản ứng theo Router
  private breadcrumbsSubject = new BehaviorSubject<string[]>([
    'M1: Quản lý Quy trình',
    'Canvas Builder (BPMN 7 Nodes)'
  ]);
  public breadcrumbs$: Observable<string[]> = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private menuService: RbacMenuService
  ) {
    // 1. Chỉ đọc Storage một lần duy nhất khi ứng dụng khởi tạo (F5/Reload)
    this.restorePermissionsFromStorage();

    // 2. Tự động cập nhật breadcrumbs khi route thay đổi
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateBreadcrumbsByUrl(url);
      });
  }

  /**
   * Khôi phục quyền từ Storage một lần duy nhất khi ứng dụng tải lại (F5 / Reload)
   * rồi nạp toàn bộ vào bộ nhớ RAM Cache.
   */
  public restorePermissionsFromStorage(): void {
    try {
      const savedRole = localStorage.getItem(this.STORAGE_KEY) as UserRole;
      if (savedRole && (PRESET_USERS[savedRole] || savedRole === 'SUPER_ADMIN')) {
        this.loadRolePermissions(savedRole, false);
      } else {
        // Mặc định nạp quyền ADMIN vào RAM
        this.loadRolePermissions('ADMIN', true);
      }
    } catch (e) {
      this.loadRolePermissions('ADMIN', false);
    }
  }

  /**
   * Nạp ma trận quyền hạn vào bộ nhớ RAM (In-Memory Map)
   */
  private loadRolePermissions(role: UserRole, saveToStorage: boolean = true): void {
    const userRoleKey = role === 'SUPER_ADMIN' ? 'ADMIN' : role;
    const session = PRESET_USERS[userRoleKey] || PRESET_USERS.ADMIN;

    // Tái tạo Map trong RAM
    this.userPermissions.clear();
    for (const perm of session.permissions) {
      this.userPermissions.set(perm.resource, new Set(perm.actions));
    }

    const currentSession: UserSession = {
      ...session,
      role
    };

    // Cập nhật State
    this.currentUserRoleSubject.next(role);
    this.currentUserSubject.next(currentSession);

    // Đồng bộ sang Menu Filter Service để cập nhật Sidebar Tree
    this.menuService.switchRole(role);

    // Cập nhật trạng thái trang mặc định tùy chỉnh của user
    this.customLandingSubject.next(this.getUserCustomLandingPage());

    if (saveToStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, role);
      } catch (e) {
        console.warn('Cannot write role to localStorage:', e);
      }
    }
  }

  /**
   * Lấy URL trang màn hình mặc định khi đăng nhập (Default Landing Page):
   * 1. Ưu tiên trang người dùng tự "Đặt làm trang mặc định" (US-08, US-09) nếu còn quyền.
   * 2. Nếu chưa đặt hoặc không có quyền: Chuyển hướng theo vai trò (US-18, REQ-04):
   *    - AGENT -> /tasks/my-tasks (M3 - US-07, FR-18)
   *    - SUPERVISOR -> /reports/dashboard (M4 - US-08, US-09, FR-26)
   *    - ADMIN / SUPER_ADMIN -> /reports/dashboard (hoặc /templates/graph)
   */
  public getDefaultLandingUrl(): string {
    const user = this.currentUserSubject.value;
    const customUrl = this.getUserCustomLandingPage();

    if (customUrl) {
      const check = this.canAccessUrl(customUrl);
      if (check.allowed) {
        return customUrl;
      }
    }

    const role = user?.role || 'ADMIN';
    return ROLE_DEFAULT_LANDING_PAGES[role] || '/reports/dashboard';
  }

  /**
   * Đọc trang mặc định tùy chỉnh của user hiện tại từ Storage (US-08, US-09)
   */
  public getUserCustomLandingPage(): string | null {
    const user = this.currentUserSubject.value;
    if (!user || !user.userId) return null;
    try {
      return localStorage.getItem(`${this.CUSTOM_LANDING_KEY_PREFIX}${user.userId}`);
    } catch {
      return null;
    }
  }

  /**
   * Người dùng tự "Đặt làm trang mặc định" (US-08, US-09)
   */
  public setUserCustomLandingPage(url: string): { success: boolean; message: string } {
    const user = this.currentUserSubject.value;
    if (!user || !user.userId) {
      return { success: false, message: 'Không tìm thấy phiên làm việc người dùng.' };
    }

    const cleanUrl = url.split('?')[0].split('#')[0];
    const check = this.canAccessUrl(cleanUrl);
    if (!check.allowed) {
      return { success: false, message: 'Bạn không có quyền truy cập trang này để đặt làm mặc định.' };
    }

    try {
      localStorage.setItem(`${this.CUSTOM_LANDING_KEY_PREFIX}${user.userId}`, cleanUrl);
      this.customLandingSubject.next(cleanUrl);
      return { success: true, message: 'Đã đặt trang này làm màn hình mặc định khi đăng nhập.' };
    } catch {
      return { success: false, message: 'Không thể lưu vào bộ nhớ trình duyệt.' };
    }
  }

  /**
   * Xóa trang mặc định tùy chỉnh (quay về mặc định theo vai trò)
   */
  public clearUserCustomLandingPage(): void {
    const user = this.currentUserSubject.value;
    if (!user || !user.userId) return;
    try {
      localStorage.removeItem(`${this.CUSTOM_LANDING_KEY_PREFIX}${user.userId}`);
      this.customLandingSubject.next(null);
    } catch {}
  }

  /**
   * Kiểm tra xem một URL có đang là trang mặc định của user hiện tại hay không
   */
  public isCurrentPageDefault(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].split('#')[0];
    const defaultUrl = this.getDefaultLandingUrl().split('?')[0].split('#')[0];
    return cleanUrl === defaultUrl;
  }

  /**
   * Kiểm tra quyền thực thi (hasPermission):
   * 1. Nếu role hiện tại là SUPER_ADMIN hoặc ADMIN: Mặc định trả về true.
   * 2. Tra cứu ma trận quyền trong RAM: kiểm tra action có tồn tại trong danh sách actions của resource hay không.
   */
  public hasPermission(resource: string, action: string = 'view'): boolean {
    const role = this.currentUserRoleSubject.value;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }

    const actions = this.userPermissions.get(resource);
    if (!actions) {
      return false;
    }

    return actions.has(action);
  }

  /**
   * Cập nhật role giả lập (cho Simulator: Admin, Trưởng ca, Điện thoại viên)
   * Tự động điều hướng đến Landing Page của role mới nếu trang hiện tại không được phép
   */
  public switchRole(role: UserRole): void {
    this.loadRolePermissions(role, true);

    const currentUrl = this.router.url;
    const access = this.canAccessUrl(currentUrl);

    // Nếu đang ở trang không được phép hoặc ở /forbidden -> Chuyển ngay về trang mặc định của role mới
    if (!access.allowed || currentUrl === '/forbidden') {
      const defaultLanding = this.getDefaultLandingUrl();
      this.router.navigateByUrl(defaultLanding);
    }
  }

  /**
   * Kiểm tra quyền truy cập theo URL dựa hoàn toàn trên cấu hình tập trung từ menu.config.ts
   */
  public canAccessUrl(url: string): {
    allowed: boolean;
    reason?: string;
    requiredResource?: string;
    breadcrumbs: string[];
  } {
    // 1. URL ngoại lệ hệ thống
    if (['/forbidden', '/login'].some(p => url.startsWith(p)) || url === '/') {
      return { allowed: true, breadcrumbs: ['Hệ thống'] };
    }

    // 2. Tra cứu cấu hình tập trung trong menu.config.ts
    const routeConfig = findRouteRbacConfig(url);
    if (!routeConfig) {
      return {
        allowed: false,
        reason: 'Đường dẫn không xác định trong hệ thống điều hướng.',
        requiredResource: 'System',
        breadcrumbs: ['Không xác định']
      };
    }

    // 3. Tra cứu nhanh ma trận quyền trong RAM Cache
    const allowed = this.hasPermission(routeConfig.resource, routeConfig.action);

    return {
      allowed,
      reason: allowed
        ? undefined
        : `Bạn không có quyền '${routeConfig.action}' trên tài nguyên '${routeConfig.resource}'`,
      requiredResource: routeConfig.resource,
      breadcrumbs: [...routeConfig.breadcrumbs]
    };
  }

  /**
   * Cập nhật Breadcrumbs theo URL Router hiện tại
   */
  public updateBreadcrumbsByUrl(url: string): void {
    const config = findRouteRbacConfig(url);
    if (config && config.breadcrumbs.length > 0) {
      this.breadcrumbsSubject.next([...config.breadcrumbs]);
    }
  }

  public setBreadcrumbs(crumbs: string[]): void {
    if (crumbs && crumbs.length > 0) {
      this.breadcrumbsSubject.next(crumbs);
    }
  }

  public getCurrentUser(): UserSession {
    return this.currentUserSubject.value;
  }

  public getCurrentRole(): UserRole {
    return this.currentUserRoleSubject.value;
  }
}
