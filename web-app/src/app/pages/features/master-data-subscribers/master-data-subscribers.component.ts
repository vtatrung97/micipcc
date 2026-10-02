import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-master-data-subscribers',
  template: `
    <div class="feature-page-container">
      <div class="page-header">
        <div>
          <div class="header-tag">PHÂN HỆ M6</div>
          <h2 class="page-title">📚 Dữ liệu Danh mục Master Data & Tra cứu</h2>
          <p class="page-subtitle">Dữ liệu thuê bao viễn thông, danh mục gói cước dịch vụ và metadata hỗ trợ luồng BPMN</p>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <h3 class="card-title">Tra cứu Thông tin Thuê bao</h3>
          <div class="filter-actions">
            <input type="text" placeholder="Nhập số điện thoại MSISDN, CCCD..." class="search-input" />
            <button class="btn btn-primary">Tìm kiếm</button>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Số Thuê bao (MSISDN)</th>
              <th>Họ tên Khách hàng</th>
              <th>Loại hình</th>
              <th>Gói cước chính</th>
              <th>Trạng thái hoạt động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>0903.123.456</code></td>
              <td>Nguyễn Văn An</td>
              <td>Trả sau (Postpaid)</td>
              <td>MF150 (Data 6GB/ngày)</td>
              <td><span class="status-pill active">Hoạt động 2 chiều</span></td>
            </tr>
            <tr>
              <td><code>0988.777.666</code></td>
              <td>Lê Thị Bình</td>
              <td>Trả trước (Prepaid)</td>
              <td>ST120K</td>
              <td><span class="status-pill active">Hoạt động 2 chiều</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .feature-page-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .header-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
    .page-title { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1f2937; }
    .page-subtitle { margin: 4px 0 0 0; color: #6b7280; font-size: 0.9rem; }
    .content-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .card-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .card-title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #111827; }
    .filter-actions { display: flex; gap: 0.75rem; }
    .search-input { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; width: 300px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .status-pill.active { background: #ecfdf5; color: #059669; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .btn { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.875rem; }
    .btn-primary { background: #0284c7; color: #fff; }
  `]
})
export class MasterDataSubscribersComponent implements OnInit {
  ngOnInit(): void {}
}
