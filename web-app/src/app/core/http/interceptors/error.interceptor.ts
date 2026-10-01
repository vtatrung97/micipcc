import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // 401 Unauthorized: Chuyển hướng về login hoặc refresh token
          console.warn('[ErrorInterceptor] 401 Unauthorized: Phiên đăng nhập hết hạn.');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // 403 Forbidden: Chuyển hướng sang màn hình từ chối quyền truy cập
          console.warn('[ErrorInterceptor] 403 Forbidden: Bạn không có quyền thực thi tác vụ này.');
          this.router.navigate(['/forbidden']);
        } else if (error.status >= 500) {
          console.error('[ErrorInterceptor] 500 Server Error:', error.message);
        }

        return throwError(() => error);
      })
    );
  }
}
