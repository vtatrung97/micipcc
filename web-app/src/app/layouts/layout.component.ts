import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isCollapsed: boolean = false;
  isEmbedded: boolean = false;

  ngOnInit(): void {
    // Ẩn Header và Sidebar nếu đang được nhúng làm Web Component trong IPCC Host Shell
    this.isEmbedded =
      !!(window as any).__IS_EMBEDDED__ ||
      !!document.getElementById('process-x-loaded') ||
      !!document.querySelector('process-procedure-app, process-management-app, process-x-app') ||
      (typeof window !== 'undefined' && window.location.port !== '4201');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
