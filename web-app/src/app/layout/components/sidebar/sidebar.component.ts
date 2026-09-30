import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { RbacMenuService, RbacService, MenuItem, SidebarNavState, UserRole, UserSession } from '@core/rbac';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  authorizedMenu: MenuItem[] = [];
  currentUser!: UserSession;
  navState!: SidebarNavState;
  
  // Trạng thái tìm kiếm nhanh menu
  searchQuery: string = '';
  filteredMenu: MenuItem[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    public rbacService: RbacMenuService,
    private coreRbacService: RbacService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Subscribe danh sách menu đã lọc theo thẩm quyền
    this.subscriptions.add(
      this.rbacService.authorizedMenu$.subscribe(menu => {
        this.authorizedMenu = menu;
        this.applySearchFilter();
      })
    );

    // 2. Subscribe thông tin User hiện tại
    this.subscriptions.add(
      this.rbacService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // 3. Subscribe trạng thái Navigation (Active path, collapsed, open submenus)
    this.subscriptions.add(
      this.rbacService.navState$.subscribe(state => {
        this.navState = state;
      })
    );

    // 4. Lắng nghe router event để tự động active menu tương ứng
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.rbacService.setActivePath(event.urlAfterRedirects || event.url);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Bật/tắt thu gọn thanh Sidebar (Collapse/Expand)
   */
  toggleCollapse(): void {
    this.rbacService.toggleSidebar();
  }

  /**
   * Bật/tắt mở Submenu cha (Accordion mode)
   */
  toggleSubmenu(item: MenuItem, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.navState.collapsed) {
      // Khi đang thu gọn, click sẽ tự động bung rộng sidebar để xem chi tiết
      this.rbacService.setCollapsed(false);
    }
    this.rbacService.toggleSubmenu(item.key);
  }

  /**
   * Điều hướng tới trang khi click vào menu leaf
   */
  navigateTo(item: MenuItem, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (item.disabled || !item.path) {
      return;
    }

    this.router.navigateByUrl(item.path);
  }

  /**
   * Đổi Role trực tiếp để test ma trận hiển thị động
   * Sau khi click vào vai trò -> Reload page
   */
  switchRole(role: UserRole): void {
    // 1. Cập nhật role vào localStorage và in-memory state
    this.coreRbacService.switchRole(role);
    this.rbacService.switchRole(role);

    // 2. Đánh dấu cờ chuyển hướng theo vai trò khi reload page
    try {
      sessionStorage.setItem('ipcc_redirect_to_role_landing', 'true');
    } catch {}

    // 3. Reload lại toàn bộ trang
    window.location.reload();
  }

  /**
   * Kiểm tra xem Submenu cha có đang mở hay không
   */
  isSubmenuOpen(key: string): boolean {
    return this.navState?.openKeys.includes(key);
  }

  /**
   * Kiểm tra xem Leaf menu có đang là Active Route hay không
   */
  isItemActive(item: MenuItem): boolean {
    if (!item.path) return false;
    return this.router.url === item.path || this.navState?.activePath === item.path;
  }

  /**
   * Kiểm tra xem Menu cha có chứa phần tử con đang Active hay không
   */
  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isItemActive(child));
  }

  /**
   * Lọc tìm kiếm menu theo từ khóa
   */
  onSearchChange(): void {
    this.applySearchFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredMenu = this.authorizedMenu;
      return;
    }

    const q = this.searchQuery.toLowerCase();
    this.filteredMenu = this.authorizedMenu
      .map(group => {
        // Nếu tên group khớp
        if (group.label.toLowerCase().includes(q)) {
          return group;
        }
        // Hoặc các con khớp
        if (group.children) {
          const matchedChildren = group.children.filter(c =>
            c.label.toLowerCase().includes(q) || (c.path && c.path.toLowerCase().includes(q))
          );
          if (matchedChildren.length > 0) {
            return { ...group, children: matchedChildren };
          }
        }
        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }

  /**
   * Tăng giảm số lượng Task để test Badge phản ứng
   */
  simulateTaskChange(delta: number): void {
    const currentStats = (this.rbacService as any).taskStatsSubject?.getValue?.() || { pending: 14, overdue: 3 };
    const newPending = Math.max(0, currentStats.pending + delta);
    const newOverdue = Math.max(0, Math.min(newPending, currentStats.overdue + (delta > 0 ? 1 : -1)));
    this.rbacService.updateTaskBadges(newPending, newOverdue);
  }
}
