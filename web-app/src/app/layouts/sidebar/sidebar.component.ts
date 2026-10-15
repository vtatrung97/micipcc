import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  iconSvg?: SafeHtml;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems: MenuItem[] = [];
  selectedId: string = 'procedure-management';

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initMenuItems();
    this.updateActiveItem(this.router.url);

    // Lắng nghe thay đổi router để tự động active menu tương ứng
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updateActiveItem(e.urlAfterRedirects || e.url);
      });
  }

  onToggle(): void {
    this.toggleCollapse.emit();
  }

  selectMenu(item: MenuItem): void {
    this.selectedId = item.id;

    // Kiểm tra xem đang chạy trong Host IPCC (/processX/... hoặc /process/...) hay Standalone (/...)
    const isInsideHost = this.router.url.startsWith('/processX') || this.router.url.startsWith('/process');
    const basePath = this.router.url.startsWith('/processX') ? '/processX' : (this.router.url.startsWith('/process') ? '/process' : '');
    const targetPath = isInsideHost ? `${basePath}/${item.path}` : `/${item.path}`;

    this.router.navigateByUrl(targetPath).catch(() => {
      // Fallback relative route
      this.router.navigate([item.path]);
    });
  }

  private updateActiveItem(url: string): void {
    if (url.includes('process-management')) {
      this.selectedId = 'process-management';
    } else {
      this.selectedId = 'procedure-management';
    }
  }

  private initMenuItems(): void {
    const rawItems = [
      {
        id: 'procedure-management',
        label: 'Quản lý quy trình',
        path: 'procedure-management',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`
      },
      {
        id: 'process-management',
        label: 'Quản lý tiến trình',
        path: 'process-management',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
      }
    ];

    this.menuItems = rawItems.map(item => ({
      id: item.id,
      label: item.label,
      path: item.path,
      iconSvg: this.sanitizer.bypassSecurityTrustHtml(item.svg)
    }));
  }
}
