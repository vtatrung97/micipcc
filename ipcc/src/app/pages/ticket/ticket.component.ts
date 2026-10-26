import { Component } from '@angular/core';

@Component({
  selector: 'app-ticket-home',
  template: `
    <div class="ticket-page-container">
      <div class="page-breadcrumb">
        <span>Trang chủ</span>
        <span class="separator">/</span>
        <span class="current">Ticket</span>
      </div>

      <div class="ticket-content-card">
        <div class="card-header">
          <div class="header-title">
            <h2>Ticket yêu cầu gần đây</h2>
            <span class="count-tag">10,000 kết quả</span>
          </div>
          <div class="search-box">
            <input type="text" placeholder="Tìm kiếm ticket..." class="ticket-search-input" />
            <button class="btn-refresh" title="Làm mới">⟳</button>
          </div>
        </div>

        <div class="ticket-table-wrapper">
          <table class="ipcc-table">
            <thead>
              <tr>
                <th>Mã Ticket</th>
                <th>Khách hàng</th>
                <th>Kênh tiếp nhận</th>
                <th>Trạng thái</th>
                <th>Độ ưu tiên</th>
                <th>Người xử lý</th>
                <th>Thời gian tạo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of mockTickets">
                <td><span class="ticket-code">{{ item.code }}</span></td>
                <td><strong>{{ item.customer }}</strong> ({{ item.phone }})</td>
                <td><span class="channel-badge" [attr.data-channel]="item.channel">{{ item.channel }}</span></td>
                <td><span class="status-badge" [attr.data-status]="item.status">{{ item.status }}</span></td>
                <td><span class="priority-badge">{{ item.priority }}</span></td>
                <td>{{ item.agent }}</td>
                <td>{{ item.createdAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ticket-page-container {
      padding: 16px 24px;
      background-color: #f0f2f5;
      min-height: calc(100vh - 48px);
    }
    .page-breadcrumb {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 16px;
      .separator { margin: 0 8px; color: #9ca3af; }
      .current { color: #111827; font-weight: 600; }
    }
    .ticket-content-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 14px;
      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        h2 { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
        .count-tag { font-size: 12px; background: #e5e7eb; color: #4b5563; padding: 2px 8px; border-radius: 12px; }
      }
      .search-box {
        display: flex;
        gap: 8px;
        .ticket-search-input {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          width: 240px;
        }
        .btn-refresh {
          padding: 6px 12px;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      }
    }
    .ipcc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      th {
        background: #f9fafb;
        color: #4b5563;
        font-weight: 600;
        text-align: left;
        padding: 10px 14px;
        border-bottom: 1px solid #e5e7eb;
      }
      td {
        padding: 12px 14px;
        border-bottom: 1px solid #f3f4f6;
        color: #374151;
      }
      tr:hover { background: #f9fafb; }
      .ticket-code { color: #2563eb; font-weight: 600; font-family: monospace; }
      .channel-badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e0f2fe;
        color: #0369a1;
      }
      .status-badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: #dcfce7;
        color: #15803d;
        font-weight: 600;
      }
      .priority-badge {
        font-size: 11px;
        color: #b45309;
        font-weight: 600;
      }
    }
  `]
})
export class TicketHomeComponent {
  mockTickets = [
    { code: 'TK-2026-00142', customer: 'Nguyễn Văn An', phone: '0988123456', channel: 'Hotline 1800', status: 'Đang xử lý', priority: 'Cao', agent: 'Lê Minh', createdAt: '22/10/2026 20:30' },
    { code: 'TK-2026-00141', customer: 'Trần Thị Mai', phone: '0977654321', channel: 'Zalo OA', status: 'Chờ duyệt', priority: 'Trung bình', agent: 'Phạm Hoa', createdAt: '22/10/2026 19:45' },
    { code: 'TK-2026-00140', customer: 'Hoàng Quốc Việt', phone: '0912348899', channel: 'Webform', status: 'Hoàn tất', priority: 'Thấp', agent: 'Vũ Nam', createdAt: '22/10/2026 18:15' },
    { code: 'TK-2026-00139', customer: 'Công ty CP Đầu Tư Alpha', phone: '0243888999', channel: 'Email', status: 'Đang xử lý', priority: 'Khẩn cấp', agent: 'Đỗ Quyên', createdAt: '22/10/2026 17:50' },
  ];
}
