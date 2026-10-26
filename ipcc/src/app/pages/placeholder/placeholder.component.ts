import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ipcc-placeholder',
  template: `
    <div style="padding: 24px; background: #f0f2f5; min-height: calc(100vh - 48px);">
      <div style="background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <h2 style="color: #1e3a8a; margin-top: 0; font-size: 20px;">IPCC Phân hệ: {{ currentPath }}</h2>
        <p style="color: #6b7280; font-size: 14px;">Màn hình giả lập của hệ thống IPCC Host đang hoạt động bình thường.</p>
        <div style="margin-top: 20px; padding: 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; font-size: 13px;">
            💡 <strong>Gợi ý:</strong> Để test Micro-Frontend ProcessX (Quản lý quy trình & tiến trình), vui lòng click vào menu <strong>ProcessX</strong> ở thanh bên trái!
          </p>
        </div>
      </div>
    </div>
  `
})
export class PlaceholderComponent implements OnInit {
  currentPath = '';
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.currentPath = this.router.url;
  }
}
