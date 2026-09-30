import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-flow-instances',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-tag">PHÂN HỆ M2</div>
          <h2 class="page-title">⚡ Giám sát Flow Instance & Lịch sử Thực thi</h2>
          <p class="page-subtitle">Theo dõi trạng thái tiến trình thời gian thực, timeline tương tác (US-23) và nhật ký hệ thống (FR-15)</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-num">1,420</span>
          <span class="stat-title">Tổng Instance trong ngày</span>
        </div>
        <div class="stat-card active">
          <span class="stat-num">38</span>
          <span class="stat-title">Đang chạy (Running)</span>
        </div>
        <div class="stat-card draft">
          <span class="stat-num">1,372</span>
          <span class="stat-title">Hoàn tất (Completed)</span>
        </div>
        <div class="stat-card warning">
          <span class="stat-num">10</span>
          <span class="stat-title">Lỗi ngoại lệ (Failed)</span>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Phiên thực thi gần nhất</h3>
          <div class="filter-actions">
            <input type="text" placeholder="Tìm kiếm Instance ID, MSISDN..." class="search-input" />
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Instance ID</th>
              <th>Tên Quy trình</th>
              <th>Thuê bao / Chủ thể</th>
              <th>Thời gian bắt đầu</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>INS-891023</code></td>
              <td>Xử lý phản ánh cước di động</td>
              <td>0903.123.456</td>
              <td>{{ '2026-09-28T09:12:00' | dateFormat }}</td>
              <td>12 phút</td>
              <td><span class="status-pill active">Running</span></td>
            </tr>
            <tr>
              <td><code>INS-891022</code></td>
              <td>Hỗ trợ kỹ thuật Internet</td>
              <td>0988.777.666</td>
              <td>{{ '2026-09-28T08:45:00' | dateFormat }}</td>
              <td>42 phút</td>
              <td><span class="status-pill completed">Completed</span></td>
            </tr>
            <tr>
              <td><code>INS-891021</code></td>
              <td>Chuyển mạng giữ số MNP</td>
              <td>0912.333.444</td>
              <td>{{ '2026-09-28T08:10:00' | dateFormat }}</td>
              <td>5 phút</td>
              <td><span class="status-pill failed">Failed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #0891b2; background: #cffafe; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .stat-num { font-size: 1.85rem; font-weight: 800; color: #111827; }
    .stat-title { font-size: 0.85rem; color: #6b7280; margin-top: 4px; }
    .stat-card.active .stat-num { color: #0891b2; }
    .stat-card.draft .stat-num { color: #10b981; }
    .stat-card.warning .stat-num { color: #ef4444; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .search-input { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; width: 280px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .status-pill { padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .status-pill.active { background: #ecfeff; color: #0891b2; }
    .status-pill.completed { background: #ecfdf5; color: #059669; }
    .status-pill.failed { background: #fef2f2; color: #ef4444; }
  `]
})
export class FlowInstancesComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {}
}
