import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-system-admin',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div>
          <div class="header-tag">PHÂN HỆ M7</div>
          <h2 class="page-title">🛡️ Quản trị Hệ thống & Phân quyền RBAC</h2>
          <p class="page-subtitle">Quản trị người dùng, cơ cấu tổ chức phòng ban và ma trận kiểm soát truy cập (Role-Based Access Control)</p>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Ma trận Vai trò & Quyền hạn (RBAC Matrix)</h3>
          <button class="btn btn-primary" *hasPermission="['Admin', 'assign_role']">
            <span>➕ Phân quyền Mới</span>
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tên Vai trò</th>
              <th>Mã Role</th>
              <th>Mô tả chức danh</th>
              <th>Tài nguyên được cấp (Resources)</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Quản trị viên</strong></td>
              <td><code>ADMIN</code></td>
              <td>Toàn quyền hệ thống & cấu hình luồng</td>
              <td>M1, M2, M3, M4, M5, M6, M7 (Full Action)</td>
              <td><span class="status-pill active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Trưởng ca vận hành</strong></td>
              <td><code>SUPERVISOR</code></td>
              <td>Giám sát vận hành & duyệt Task SLA</td>
              <td>M1 (view), M2, M3 (approve), M4 (export), M6</td>
              <td><span class="status-pill active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Điện thoại viên</strong></td>
              <td><code>AGENT</code></td>
              <td>Tiếp nhận và xử lý Task nghiệp vụ</td>
              <td>M3 (execute), M6 (view-only)</td>
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
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #4338ca; background: #e0e7ff; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .status-pill.active { background: #ecfdf5; color: #059669; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .btn { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.875rem; }
    .btn-primary { background: #4338ca; color: #fff; }
  `]
})
export class SystemAdminComponent implements OnInit {
  ngOnInit(): void {}
}
