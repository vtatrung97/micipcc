import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Subscription } from 'rxjs';
import { getProcessXRemoteUrl } from '../../app-routing.module';
import { RemoteLoaderService } from '@core/services/remote-loader.service';

declare const __webpack_share_scopes__: any;

@Component({
  selector: 'app-process-x-wrapper',
  template: `
    <div class="process-x-host-container" style="width: 100%; height: 100%; min-height: 600px; position: relative;">
      <!-- Loading indicator khi đang nạp Web Component -->
      <div *ngIf="isLoading" class="loading-state" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #6b7280;">
        <span>Đang nạp phân hệ ProcessX (Web Component)...</span>
      </div>

      <!-- Lỗi kết nối nếu không thể tải remoteEntry -->
      <div *ngIf="hasError" class="error-state" style="padding: 24px; color: #ef4444; background: #fee2e2; border-radius: 8px; margin: 16px;">
        <p><strong>Không thể kết nối đến ProcessX Web Component!</strong></p>
        <p>Vui lòng đảm bảo Remote App (port 4201) đang chạy.</p>
      </div>

      <!-- Thẻ Web Component chuẩn HTML <process-x-app> -->
      <process-x-app
        *ngIf="isLoaded"
        [attr.route]="subRoute"
        [attr.token]="token"
        (routeChanged)="onRemoteRouteChange($event)">
      </process-x-app>
    </div>
  `
})
export class ProcessXWrapperComponent implements OnInit, OnDestroy {
  isLoading = true;
  isLoaded = false;
  hasError = false;

  subRoute = '';
  token = '';

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private remoteLoader: RemoteLoaderService
  ) {}

  async ngOnInit(): Promise<void> {
    this.token = localStorage.getItem('access_token') || '';

    try {
      this.isLoading = true;
      await this.remoteLoader.loadProcessXScripts();
      this.isLoaded = true;
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('[Host IPCC] Nạp thủ công ProcessX thất bại:', err);
      this.hasError = true;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    // 2. Lắng nghe URL từ Host để truyền xuống Web Component
    this.sub = this.route.url.subscribe(() => {
      // Ví dụ: URL Host là /processX/procedure-management/graph
      // thì subRoute lấy từ snapshot URL:
      const fullUrl = this.router.url;
      // Cắt bỏ prefix /processX để lấy phần route con
      const matched = fullUrl.match(/^\/processX\/?(.*)$/);
      this.subRoute = matched && matched[1] ? matched[1] : 'procedure-management';
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Khi người dùng chuyển trang bên trong Web Component (ví dụ: bấm vào Tạo quy trình) */
  onRemoteRouteChange(event: any): void {
    const rawPath = event?.detail || event || '';
    if (typeof rawPath === 'string' && rawPath) {
      const cleanPath = rawPath.replace(/^\/+/, '');
      const newHostUrl = `/processX/${cleanPath}`;
      // Cập nhật URL trên thanh trình duyệt mà không reload trang
      this.location.go(newHostUrl);
    }
  }
}
