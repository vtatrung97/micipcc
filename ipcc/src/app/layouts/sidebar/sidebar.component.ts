import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { MenuItem } from './menu.model';
import { DEFAULT_IPCC_MENUS, DEFAULT_IPCC_URLS } from './menu';

export interface UIMenuItem extends MenuItem {
  safeSvg?: SafeHtml;
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems: any[] = [];
  activeUrl: string = '/ticket';
  openSubmenuIds: Set<string> = new Set<string>(['processX']);

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.initMenuFromStorage();
    this.updateActiveUrl(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updateActiveUrl(e.urlAfterRedirects || e.url);
      });
  }

  /**
   * Đọc danh sách menu từ localStorage ('menu').
   * Nếu chưa có dữ liệu, tự động khởi tạo DEFAULT_IPCC_MENUS vào localStorage.
   */
  public initMenuFromStorage(): void {
    let rawMenus: MenuItem[] = [];
    try {
      const stored = localStorage.getItem('menu');
      if (stored) {
        rawMenus = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[SidebarComponent] Lỗi parse menu từ localStorage:', e);
    }

    if (!rawMenus || rawMenus.length === 0) {
      rawMenus = DEFAULT_IPCC_MENUS;
      try {
        localStorage.setItem('menu', JSON.stringify(DEFAULT_IPCC_MENUS));
        localStorage.setItem('menuUrl', JSON.stringify(DEFAULT_IPCC_URLS));
      } catch (e) {}
    }

    this.menuItems = this.prepareMenuItems(rawMenus);
  }

  /**
   * Reset menu về mặc định IPCC trong localStorage
   */
  public resetToDefaultMenu(): void {
    localStorage.setItem('menu', JSON.stringify(DEFAULT_IPCC_MENUS));
    localStorage.setItem('menuUrl', JSON.stringify(DEFAULT_IPCC_URLS));
    this.initMenuFromStorage();
  }

  private prepareMenuItems(items: MenuItem[]): any[] {
    return items.map(item => ({
      ...item,
      safeSvg: item.svg ? this.sanitizer.bypassSecurityTrustHtml(item.svg) : null,
      subItems: item.subItems && item.subItems.length > 0 ? this.prepareMenuItems(item.subItems) : []
    }));
  }

  onToggle(): void {
    this.toggleCollapse.emit();
  }

  /**
   * Xử lý click vào item
   */
  onItemClick(item: any, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    // Nếu có submenu con (như ProcessX)
    if (item.subItems && item.subItems.length > 0) {
      if (this.openSubmenuIds.has(item.id)) {
        this.openSubmenuIds.delete(item.id);
      } else {
        this.openSubmenuIds.add(item.id);
      }
      return;
    }

    // Nếu là menu lá có link
    if (item.link) {
      this.router.navigateByUrl(item.link).catch(err => {
        console.warn('[IPCC Host] Điều hướng thất bại, fallback relative:', item.link, err);
        this.router.navigate([item.link]);
      });
    }
  }

  isSubmenuOpen(item: any): boolean {
    return this.openSubmenuIds.has(item.id);
  }

  isItemActive(item: any): boolean {
    if (item.link && this.activeUrl.startsWith(item.link)) {
      return true;
    }
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some((child: any) => child.link && this.activeUrl.startsWith(child.link));
    }
    return false;
  }

  isChildActive(child: any): boolean {
    return !!(child.link && this.activeUrl.startsWith(child.link));
  }

  private updateActiveUrl(url: string): void {
    this.activeUrl = url;

    // Tự động mở submenu cha nếu có menu con đang active
    for (const item of this.menuItems) {
      if (item.subItems && item.subItems.length > 0) {
        if (item.subItems.some((child: any) => child.link && url.startsWith(child.link))) {
          this.openSubmenuIds.add(item.id);
        }
      }
    }
  }
}
