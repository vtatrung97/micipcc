import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-operation-settings',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div>
          <div class="header-tag">PHÂN HỆ M5</div>
          <h2 class="page-title">⚙️ Thiết lập Vận hành & Cấu hình SLA Escalation</h2>
          <p class="page-subtitle">Quy tắc leo thang cảnh báo SLA, tự động chia việc, webhook tích hợp và mẫu thông báo đa kênh</p>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Cấu hình Quy tắc Leo thang (SLA Escalation Rules)</h3>
          <button class="btn btn-primary" *hasPermission="['Setting', 'edit']">
            <span>➕ Thêm Quy tắc Escalation</span>
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Cấp độ</th>
              <th>Ngưỡng thời gian</th>
              <th>Hành động thực thi</th>
              <th>Kênh thông báo</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="level-badge l1">Level 1 (Cảnh báo sớm)</span></td>
              <td>Còn 30% thời lượng SLA</td>
              <td>Gửi thông báo nhắc nhở nhân viên phụ trách</td>
              <td>Telegram, Hệ thống Notification</td>
              <td><span class="status-pill active">Active</span></td>
            </tr>
            <tr>
              <td><span class="level-badge l2">Level 2 (Báo động)</span></td>
              <td>Còn 10% thời lượng SLA</td>
              <td>Gửi cảnh báo tới Trưởng ca / Supervisor</td>
              <td>Zalo ZNS, Email, SMS khẩn</td>
              <td><span class="status-pill active">Active</span></td>
            </tr>
            <tr>
              <td><span class="level-badge l3">Level 3 (Vi phạm SLA)</span></td>
              <td>0% (Quá hạn)</td>
              <td>Tự động Re-assign cho cấp chuyên gia + Log Audit</td>
              <td>WebHook IPCC, Email Ban Giám đốc</td>
              <td><span class="status-pill active">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #ea580c; background: #ffedd5; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .level-badge { padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .level-badge.l1 { background: #fef3c7; color: #d97706; }
    .level-badge.l2 { background: #ffedd5; color: #ea580c; }
    .level-badge.l3 { background: #fee2e2; color: #dc2626; }
    .status-pill.active { background: #ecfdf5; color: #059669; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .btn { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.875rem; }
    .btn-primary { background: #ea580c; color: #fff; }
  `]
})
export class OperationSettingsComponent implements OnInit {
  ngOnInit(): void {}
}
