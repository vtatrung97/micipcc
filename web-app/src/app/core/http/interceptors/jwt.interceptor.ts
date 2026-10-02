import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

import { TokenService } from '../../auth/token.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Lấy Access Token thực tế từ Keycloak OAuthService hoặc Cookie / Storage
    const token = this.authService.getAccessToken() || TokenService.getAccessToken();

    const setHeaders: { [name: string]: string } = {};

    // Chỉ đính kèm Authorization header nếu có token thật (bỏ mock token giả)
    if (token && token !== 'mock_ipcc2_jwt_token') {
      setHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 2. Clone request: BẬT withCredentials: true để trình duyệt gửi kèm Cookie sang Backend API
    const clonedRequest = request.clone({
      withCredentials: true,
      setHeaders
    });

    return next.handle(clonedRequest);
  }
}
