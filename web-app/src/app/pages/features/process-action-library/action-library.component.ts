import { Component, OnInit } from '@angular/core';
import { ActionLibraryService, ActionItem } from '@core/services/action-library.service';

@Component({
  selector: 'app-action-library',
  templateUrl: './action-library.component.html',
  styleUrls: ['./action-library.component.scss']
})
export class ActionLibraryComponent implements OnInit {
  isLoading: boolean = false;
  actions: ActionItem[] = [];
  filteredActions: ActionItem[] = [];

  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  page: number = 1;
  pageSize: number = 10;

  showPingModal: boolean = false;
  pingTargetAction?: ActionItem;
  isPinging: boolean = false;

  categoryOptions = [
    { value: '', label: 'Tất cả phân loại' },
    { value: 'Thông báo & SMS', label: 'Thông báo & SMS' },
    { value: 'Cước & Billing', label: 'Cước & Billing' },
    { value: 'Kỹ thuật Mạng Broadband', label: 'Kỹ thuật Mạng Broadband' }
  ];

  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Active', label: 'Hoạt động (Active)' },
    { value: 'Inactive', label: 'Tạm dừng (Inactive)' },
    { value: 'Draft', label: 'Bản nháp (Draft)' }
  ];

  constructor(private actionService: ActionLibraryService) {}

  ngOnInit(): void {
    this.loadActions();
  }

  loadActions(): void {
    this.isLoading = true;
    this.actionService.fetchActions().subscribe({
      next: (items) => {
        this.actions = items;
        this.filterActions();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterActions(): void {
    let res = [...this.actions];
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      res = res.filter(a => 
        a.code.toLowerCase().includes(q) || 
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    if (this.selectedCategory) {
      res = res.filter(a => a.category === this.selectedCategory);
    }
    if (this.selectedStatus) {
      res = res.filter(a => a.status === this.selectedStatus);
    }
    this.filteredActions = res;
    this.page = 1;
  }

  get paginatedActions(): ActionItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredActions.slice(start, start + this.pageSize);
  }

  openPingModal(action: ActionItem): void {
    this.pingTargetAction = action;
    this.showPingModal = true;
  }

  executePing(): void {
    if (!this.pingTargetAction) return;
    this.isPinging = true;
    setTimeout(() => {
      this.isPinging = false;
      this.showPingModal = false;
    }, 800);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filterActions();
  }

  // Modal Đăng ký Action Mới
  showCreateModal: boolean = false;
  isSavingAction: boolean = false;
  newAction: Partial<ActionItem> = {
    code: '',
    name: '',
    type: 'REST_API',
    category: 'Thông báo & SMS',
    provider: '',
    version: '1.0',
    description: '',
    status: 'Active'
  };

  typeOptions = [
    { value: 'REST_API', label: 'REST API' },
    { value: 'WEBHOOK', label: 'Webhook' },
    { value: 'SMS_GATEWAY', label: 'SMS Gateway' },
    { value: 'ZALO_ZNS', label: 'Zalo ZNS' },
    { value: 'EMAIL', label: 'Email SMTP' }
  ];

  openCreateModal(): void {
    this.newAction = {
      code: `ACT_${Date.now().toString().slice(-4)}`,
      name: '',
      type: 'REST_API',
      category: 'Thông báo & SMS',
      provider: 'Viettel Telecom',
      version: '1.0',
      description: '',
      status: 'Active'
    };
    this.showCreateModal = true;
  }

  saveNewAction(): void {
    if (!this.newAction.code || !this.newAction.name) return;
    this.isSavingAction = true;
    this.actionService.createAction(this.newAction).subscribe({
      next: (created) => {
        this.actions = [created, ...this.actions];
        this.filterActions();
        this.isSavingAction = false;
        this.showCreateModal = false;
      },
      error: () => {
        this.isSavingAction = false;
        this.showCreateModal = false;
      }
    });
  }
}
