import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RbacService } from '@core/rbac';

@Component({
  selector: 'app-reports-dashboard',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div class="header-text-group">
          <div class="header-tag">PHÂN HỆ M4 • BÁO CÁO & DASHBOARD</div>
          <h2 class="page-title">📊 Báo cáo & Dashboard Chỉ số SLA</h2>
          <p class="page-subtitle">Thống kê chỉ số hoàn thành cam kết SLA, phân bổ luồng theo thời gian và đánh giá hiệu suất vận hành (US-08, US-09)</p>
        </div>

        <!-- US-08 Main Flow Bước 3: Người dùng lưu, chia sẻ hoặc đặt làm dashboard mặc định -->
        <div class="header-actions">
          <button class="action-btn set-default-btn" 
                  [class.is-default]="isDefaultDashboard"
                  (click)="toggleDefaultDashboard()"
                  title="Đặt màn hình Dashboard này hiển thị đầu tiên mỗi khi bạn đăng nhập (US-08)">
            <span class="btn-icon">{{ isDefaultDashboard ? '⭐' : '☆' }}</span>
            <span>{{ isDefaultDashboard ? 'Đang là Dashboard mặc định' : 'Đặt làm Dashboard mặc định' }}</span>
          </button>

          <button class="action-btn share-btn" 
                  (click)="shareDashboard()"
                  title="Chia sẻ liên kết Dashboard này tới đồng nghiệp (US-08)">
            <span class="btn-icon">📤</span>
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      <!-- Banner Toast thông báo phản hồi thao tác -->
      <div class="notification-toast" *ngIf="toastMessage">
        <span class="toast-icon">✨</span>
        <span class="toast-text">{{ toastMessage }}</span>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">98.4%</span>
          <span class="stat-title">Tỷ lệ đạt SLA toàn mạng</span>
        </div>
        <div class="stat-card active">
          <span class="stat-num">4.2h</span>
          <span class="stat-title">Thời gian xử lý TB (MTTR)</span>
        </div>
        <div class="stat-card warning">
          <span class="stat-num">1.6%</span>
          <span class="stat-title">Vi phạm SLA (Breached)</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">48,200</span>
          <span class="stat-title">Tổng yêu cầu trong tháng</span>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Phân tích SLA theo Quy trình nghiệp vụ</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Quy trình</th>
              <th>Tổng lượt xử lý</th>
              <th>Đạt cam kết</th>
              <th>Vi phạm SLA</th>
              <th>Chỉ số Tuân thủ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Xử lý phản ánh cước di động</strong></td>
              <td>12,400</td>
              <td>12,210</td>
              <td>190</td>
              <td><span class="compliance-good">98.5%</span></td>
            </tr>
            <tr>
              <td><strong>Hỗ trợ kỹ thuật Internet & Truyền hình</strong></td>
              <td>24,100</td>
              <td>23,600</td>
              <td>500</td>
              <td><span class="compliance-good">97.9%</span></td>
            </tr>
            <tr>
              <td><strong>Chuyển mạng giữ số (MNP)</strong></td>
              <td>11,700</td>
              <td>11,620</td>
              <td>80</td>
              <td><span class="compliance-excellent">99.3%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #7c3aed; background: #ede9fe; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .action-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid #e5e7eb; background: #ffffff; color: #374151; }
    .action-btn:hover { background: #f9fafb; border-color: #d1d5db; }
    .set-default-btn.is-default { background: #fef3c7; border-color: #f59e0b; color: #b45309; }
    .set-default-btn.is-default:hover { background: #fde68a; }
    .share-btn:hover { color: #2563eb; border-color: #93c5fd; }
    .btn-icon { font-size: 1rem; line-height: 1; }

    .notification-toast { display: flex; align-items: center; gap: 0.5rem; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.25rem; font-size: 0.875rem; animation: slideDown 0.25s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .stat-num { font-size: 1.85rem; font-weight: 800; color: #111827; }
    .stat-title { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }
    .stat-card.active .stat-num { color: #7c3aed; }
    .stat-card.warning .stat-num { color: #ef4444; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .compliance-good { color: #059669; font-weight: 700; }
    .compliance-excellent { color: #2563eb; font-weight: 700; }
  `]
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  isDefaultDashboard: boolean = false;
  toastMessage: string | null = null;
  private toastTimer: any = null;
  private sub = new Subscription();

  constructor(private rbacService: RbacService) {}

  ngOnInit(): void {
    this.checkDefaultStatus();
    this.sub.add(
      this.rbacService.customLanding$.subscribe(() => {
        this.checkDefaultStatus();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  checkDefaultStatus(): void {
    this.isDefaultDashboard = this.rbacService.isCurrentPageDefault('/reports/dashboard');
  }

  toggleDefaultDashboard(): void {
    if (this.isDefaultDashboard) {
      this.rbacService.clearUserCustomLandingPage();
      this.showToast('Đã hủy đặt làm mặc định. Khi đăng nhập, hệ thống sẽ mở màn hình theo vai trò người dùng.');
    } else {
      const res = this.rbacService.setUserCustomLandingPage('/reports/dashboard');
      if (res.success) {
        this.showToast('⭐ Đã đặt Báo cáo & Dashboard làm màn hình mặc định khi bạn đăng nhập (US-08)!');
      } else {
        this.showToast(res.message);
      }
    }
    this.checkDefaultStatus();
  }

  shareDashboard(): void {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('📤 Đã sao chép liên kết Dashboard vào bộ nhớ tạm để chia sẻ (US-08)!');
    } else {
      this.showToast(`📤 Liên kết Dashboard: ${window.location.href}`);
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = null;
    }, 4500);
  }
}
