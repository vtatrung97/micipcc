import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { RbacService } from '../services/rbac.service';

/**
 * ============================================================================
 * DEFAULT LANDING ROUTE GUARD
 * ============================================================================
 * Chuyển hướng thông minh khi người dùng vào URL gốc ('/'):
 * 1. Ưu tiên trang người dùng tự "Đặt làm trang mặc định" (US-08, US-09).
 * 2. Nếu chưa đặt hoặc không có quyền: Chuyển hướng theo vai trò (US-18, REQ-04):
 *    - AGENT: Task của tôi (/tasks/my-tasks)
 *    - SUPERVISOR: Dashboard tổng quan (/reports/dashboard)
 *    - ADMIN: Dashboard tổng quan (/reports/dashboard)
 * ============================================================================
 */
@Injectable({
  providedIn: 'root'
})
export class DefaultLandingGuard implements CanActivate {
  constructor(
    private rbacService: RbacService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const landingUrl = this.rbacService.getDefaultLandingUrl();
    return this.router.parseUrl(landingUrl);
  }
}
