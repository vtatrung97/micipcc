import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-management',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div>
          <div class="header-tag">PHÂN HỆ M3</div>
          <h2 class="page-title">✅ Quản lý Task & Phê duyệt (Inbox)</h2>
          <p class="page-subtitle">Danh sách Task được phân bổ, xử lý phê duyệt / reject và tra cứu dữ liệu tham chiếu</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">14</span>
          <span class="stat-title">Task được giao</span>
        </div>
        <div class="stat-card warning">
          <span class="stat-num">3</span>
          <span class="stat-title">Quá hạn SLA ⚠️</span>
        </div>
        <div class="stat-card pending">
          <span class="stat-num">7</span>
          <span class="stat-title">Chờ duyệt (Pending)</span>
        </div>
        <div class="stat-card completed">
          <span class="stat-num">182</span>
          <span class="stat-title">Đã hoàn thành</span>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Hộp thư công việc (Work Inbox)</h3>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Mã Task</th>
              <th>Tiêu đề Task</th>
              <th>Người giao / Khách hàng</th>
              <th>Thời hạn SLA</th>
              <th>Độ ưu tiên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>TSK-10041</code></td>
              <td>Phê duyệt hủy cước bất thường 500k</td>
              <td>Nguyễn Văn A (0903.111.222)</td>
              <td><app-sla-badge status="danger" text="Quá hạn" [isPulse]="true"></app-sla-badge></td>
              <td><span class="priority-high">Gấp (High)</span></td>
              <td>
                <button class="btn btn-sm btn-approve" *hasPermission="['Task', 'approve']">Duyệt</button>
                <button class="btn btn-sm btn-reject" *hasPermission="['Task', 'execute']">Từ chối</button>
              </td>
            </tr>
            <tr>
              <td><code>TSK-10042</code></td>
              <td>Kiểm tra cổng OLT trạm Ba Đình</td>
              <td>Trần Thị B (0982.333.444)</td>
              <td><app-sla-badge status="normal" text="2h SLA"></app-sla-badge></td>
              <td><span class="priority-normal">Bình thường</span></td>
              <td>
                <button class="btn btn-sm btn-approve" *hasPermission="['Task', 'approve']">Duyệt</button>
                <button class="btn btn-sm btn-reject" *hasPermission="['Task', 'execute']">Từ chối</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #1677ff; background: #e6f4ff; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .stat-num { font-size: 1.85rem; font-weight: 800; color: #111827; }
    .stat-title { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }
    .stat-card.warning .stat-num { color: #ef4444; }
    .stat-card.pending .stat-num { color: #f59e0b; }
    .stat-card.completed .stat-num { color: #10b981; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .priority-high { color: #dc2626; font-weight: 700; }
    .priority-normal { color: #4b5563; font-weight: 500; }
    .btn { display: inline-flex; align-items: center; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; }
    .btn-sm { padding: 4px 10px; font-size: 0.8rem; margin-right: 6px; }
    .btn-approve { background: #1677ff; color: #fff; }
    .btn-reject { background: #f3f4f6; color: #4b5563; }
  `]
})
export class TaskManagementComponent implements OnInit {
  ngOnInit(): void {}
}
