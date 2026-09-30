import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { RbacService } from '../services/rbac.service';

/**
 * ============================================================================
 * IPCC 2.0 FLOW SYSTEM - CENTRALIZED RBAC ROUTE GUARD
 * ============================================================================
 * Không đọc thô từ route.data.
 * Tra cứu thẩm quyền trực tiếp từ In-Memory RAM Cache và menu.config.ts.
 * Tự động cập nhật Breadcrumbs theo Router và redirect 403 khi vi phạm.
 * ============================================================================
 */
@Injectable({
  providedIn: 'root'
})
export class RbacRouteGuard implements CanActivate, CanActivateChild {
  constructor(
    private rbacService: RbacService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(state.url);
  }

  /**
   * Kiểm tra thẩm quyền truy cập URL mục tiêu trực tiếp từ ma trận RAM Cache
   */
  private checkAccess(url: string): boolean | UrlTree {
    // 1. Xử lý cờ chuyển hướng theo vai trò khi reload page (sau khi click đổi vai trò)
    try {
      const isRoleReload = sessionStorage.getItem('ipcc_redirect_to_role_landing') === 'true';
      if (isRoleReload) {
        sessionStorage.removeItem('ipcc_redirect_to_role_landing');
        const roleLandingUrl = this.rbacService.getDefaultLandingUrl();
        if (url !== roleLandingUrl && !url.startsWith(roleLandingUrl)) {
          return this.router.parseUrl(roleLandingUrl);
        }
      }
    } catch {}

    // 2. Cho phép các route đặc biệt
    if (url === '/forbidden' || url.startsWith('/forbidden?') || url === '/login') {
      return true;
    }

    // 3. Kiểm tra thẩm quyền qua In-Memory RbacService và cấu hình tập trung từ menu.config.ts
    const checkResult = this.rbacService.canAccessUrl(url);

    if (checkResult.allowed) {
      // Tự động cập nhật Breadcrumbs theo Router hiện tại
      this.rbacService.setBreadcrumbs(checkResult.breadcrumbs);
      return true;
    }

    // 4. Nếu không có quyền đối với URL hiện tại (ví dụ: F5 reload trên trang không hợp lệ):
    // Tự động điều hướng đến URL tương ứng theo vai trò thay vì kẹt ở 403
    const fallbackLandingUrl = this.rbacService.getDefaultLandingUrl();
    if (url !== fallbackLandingUrl && !url.startsWith(fallbackLandingUrl)) {
      console.warn(`[RBAC Route Guard] ⛔ URL ${url} không thuộc thẩm quyền vai trò ${this.rbacService.getCurrentRole()}. Điều hướng về URL tương ứng: ${fallbackLandingUrl}`);
      return this.router.parseUrl(fallbackLandingUrl);
    }

    // 5. User không có quyền và đã ở fallback URL -> Redirect về trang 403 Forbidden
    console.warn(`[RBAC Route Guard] ⛔ TRUY CẬP BỊ TỪ CHỐI: ${url}. Lý do: ${checkResult.reason}`);

    return this.router.createUrlTree(['/forbidden'], {
      queryParams: {
        attemptedUrl: url,
        resource: checkResult.requiredResource,
        role: this.rbacService.getCurrentRole(),
        message: checkResult.reason
      }
    });
  }
}
