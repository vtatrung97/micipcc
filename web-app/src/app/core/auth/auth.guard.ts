import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';
import { environment, AUTH_ENABLED } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    // Tắt auth (env.js: AUTH_ENABLED = false) → cho vào thẳng
    if (!AUTH_ENABLED || this.authService.isLoggedIn()) {
      return true;
    }

    // Chế độ Development (local): Nếu chưa đăng nhập Keycloak hoặc Keycloak khác IP/chưa kết nối,
    // cho phép bypass để lập trình viên kiểm thử và xem giao diện bình thường, không bị văng ra 404
    if (!environment.production) {
      return true;
    }

    // Nếu chưa đăng nhập trên môi trường Production, kích hoạt login flow chuyển đến Keycloak
    this.authService.login();
    return false;
  }
}
