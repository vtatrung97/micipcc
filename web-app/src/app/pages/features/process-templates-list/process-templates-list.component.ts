import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TemplateService, ProcessTemplateItem } from '@core/services/template.service';
import { RbacService } from '@core/rbac/services/rbac.service';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu.component';
import { TableSelection } from '@shared/utils/table-selection';
import {
  ProcessAdvancedFilter,
  EMPTY_ADVANCED_FILTER,
  countAdvancedFilter,
  DateRange,
  hasDateRange
} from './components/advanced-filter-drawer/advanced-filter-drawer.component';
import { PROCESS_STATUS_CONFIG } from './config/process-status.config';
import { ProcessRow } from './models/process-row.model';
import { ProcessAction } from './components/process-action-modal/process-action-modal.component';
import {
  PROCESS_COLUMNS,
  PROCESS_HIDDEN_COLUMNS_STORAGE_KEY,
  ProcessColumn,
  ProcessColumnKey
} from './config/process-columns.config';

type StatusFilter = '' | 'Published' | 'Draft';

const TRIGGER_LABELS: Record<string, string> = {
  MANUAL: 'Kích hoạt thủ công',
  AUTO: 'Kích hoạt tự động',
  SCHEDULE: 'Lặp lịch',
  HYBRID: 'Hybrid'
};

const EMPTY_TEXT = '—';

/**
 * Màn "Danh sách quy trình":
 * Title + "Tạo quy trình" → tìm kiếm + chip lọc nhanh + "Bộ lọc nâng cao" + "Sắp xếp" (ẩn/hiện cột) → bảng + phân trang.
 */
@Component({
  selector: 'app-process-templates-list',
  templateUrl: './process-templates-list.component.html',
  styleUrls: ['./process-templates-list.component.scss']
})
export class ProcessTemplatesListComponent implements OnInit, OnDestroy {
  allTemplates: ProcessTemplateItem[] = [];
  isLoading: boolean = false;

  searchKeyword: string = '';
  statusFilter: StatusFilter = '';

  showAdvancedFilter: boolean = false;
  advancedFilter: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };

  page: number = 1;
  pageSize: number = 10;

  /** Modal xác nhận thao tác (nhân bản / ban hành / dừng ban hành / xóa); null = đóng */
  modalAction: ProcessAction | null = null;
  modalRows: ProcessRow[] = [];

  readonly selection = new TableSelection<ProcessRow>(row => row.item.code);

  readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'Published', label: PROCESS_STATUS_CONFIG.Published.label },
    { value: 'Draft', label: PROCESS_STATUS_CONFIG.Draft.label }
  ];

  /** Cột ẩn/hiện được; STT và Hành động luôn hiện nên không có trong danh sách */
  readonly columns: ProcessColumn[] = PROCESS_COLUMNS;
  hiddenColumns: Set<ProcessColumnKey> = this.loadHiddenColumns();

  readonly icons = {
    plus: 'assets/icons/processx/plus-white.svg',
    filter: 'assets/icons/processx/filter-primary.svg',
    sort: 'assets/icons/processx/sort.svg',
    edit: 'assets/icons/processx/edit.svg',
    view: 'assets/icons/processx/eye.svg',
    // Icon trong menu ⋮ của hàng
    copy: 'assets/icons/processx/copy.svg',
    stopPublish: 'assets/icons/processx/send-cancelled.svg',
    delete: 'assets/icons/processx/trash-danger.svg'
  };

  /** Hàng đã lọc + sắp xếp (tính lại khi dữ liệu hoặc bộ lọc đổi) */
  filteredRows: ProcessRow[] = [];
  /** Phiên bản đang tồn tại thực tế (cho drawer Bộ lọc nâng cao) */
  versionOptions: SelectOption[] = [];
  pagedRows: ProcessRow[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private templateService: TemplateService,
    private rbacService: RbacService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.templateService.templates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        this.allTemplates = list || [];
        this.versionOptions = this.buildVersionOptions();
        this.refresh();
      });

    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.templateService.fetchTemplatesFromApi()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => (this.isLoading = false),
        error: () => (this.isLoading = false)
      });
  }

  // ===== Quyền thao tác =====
  get canCreate(): boolean {
    return this.rbacService.hasPermission('Template', 'create');
  }

  get canEdit(): boolean {
    return this.rbacService.hasPermission('Template', 'edit');
  }

  get canDelete(): boolean {
    return this.rbacService.hasPermission('Template', 'delete');
  }

  // ===== Lọc / sắp xếp / phân trang =====
  get advancedFilterCount(): number {
    return countAdvancedFilter(this.advancedFilter);
  }

  // ===== Ẩn / hiện cột (nút "Sắp xếp") =====
  isColumnVisible(key: ProcessColumnKey): boolean {
    return !this.hiddenColumns.has(key);
  }

  get isAllColumnsVisible(): boolean {
    return this.hiddenColumns.size === 0;
  }

  get isSomeColumnsVisible(): boolean {
    return this.hiddenColumns.size > 0 && this.hiddenColumns.size < this.columns.length;
  }

  toggleColumn(key: ProcessColumnKey, visible: boolean): void {
    visible ? this.hiddenColumns.delete(key) : this.hiddenColumns.add(key);
    this.saveHiddenColumns();
  }

  toggleAllColumns(visible: boolean): void {
    this.hiddenColumns = visible ? new Set() : new Set(this.columns.map(c => c.key));
    this.saveHiddenColumns();
  }

  private loadHiddenColumns(): Set<ProcessColumnKey> {
    try {
      const raw = JSON.parse(localStorage.getItem(PROCESS_HIDDEN_COLUMNS_STORAGE_KEY) || '[]');
      const known = new Set(this.columns.map(c => c.key));
      return new Set((Array.isArray(raw) ? raw : []).filter((k: ProcessColumnKey) => known.has(k)));
    } catch {
      return new Set();
    }
  }

  private saveHiddenColumns(): void {
    try {
      localStorage.setItem(PROCESS_HIDDEN_COLUMNS_STORAGE_KEY, JSON.stringify(Array.from(this.hiddenColumns)));
    } catch {}
  }

  // Tính lại chỉ khi danh sách đổi: getter trả mảng mới mỗi vòng change detection
  // khiến ant-select dựng lại DOM option liên tục → click vào option không ăn
  private buildVersionOptions(): SelectOption[] {
    const versions = Array.from(new Set(this.allTemplates.map(t => t.version).filter(Boolean)));
    return versions
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(v => ({ value: v, label: v }));
  }

  onSearchChange(): void {
    this.page = 1;
    this.refresh();
  }

  onStatusChange(): void {
    this.page = 1;
    this.refresh();
  }

  applyAdvancedFilter(filter: ProcessAdvancedFilter): void {
    this.advancedFilter = filter;
    this.showAdvancedFilter = false;
    this.page = 1;
    this.refresh();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.updatePage();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.updatePage();
  }

  /** STT liên tục qua các trang */
  rowIndex(i: number): number {
    return (this.page - 1) * this.pageSize + i + 1;
  }

  trackByCode(_: number, row: ProcessRow): string {
    return row.item.code;
  }

  private refresh(): void {
    const keyword = this.searchKeyword.trim().toLowerCase();
    const rows = this.allTemplates
      .filter(item =>
        (!keyword || item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)) &&
        (!this.statusFilter || item.status === this.statusFilter) &&
        this.matchAdvanced(item))
      .map(item => this.toRow(item));

    this.filteredRows = this.sortRows(rows);

    const lastPage = Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
    if (this.page > lastPage) this.page = lastPage;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.page - 1) * this.pageSize;
    this.pagedRows = this.filteredRows.slice(start, start + this.pageSize);
  }

  /** Sắp xếp bản ghi mới tạo lên đầu */
  private sortRows(rows: ProcessRow[]): ProcessRow[] {
    const byCreated = (r: ProcessRow) => this.toTimestamp(r.item.created_at || r.item.updatedAt || r.item.published_at);
    return [...rows].sort((a, b) => byCreated(b) - byCreated(a));
  }

  private matchAdvanced(item: ProcessTemplateItem): boolean {
    const f = this.advancedFilter;
    const includes = (text: string | undefined, kw: string) =>
      !kw || (text || '').toLowerCase().includes(kw.toLowerCase());

    return includes(item.name, f.name)
      && includes(item.code, f.code)
      && (!f.version || item.version === f.version)
      && (!f.status || item.status === f.status)
      && this.inRange(item.updatedAt, f.updatedRange)
      && this.inRange(item.status !== 'Draft' ? item.published_at : undefined, f.publishedRange);
  }

  /** Ngày ('DD/MM/YYYY HH:mm') nằm trong khoảng [from, to] (YYYY-MM-DD, tính cả 2 đầu) */
  private inRange(value: string | undefined, range: DateRange | null): boolean {
    if (!hasDateRange(range)) return true;
    const iso = this.toIsoDate(value);
    if (!iso) return false;
    return (!range!.from || iso >= range!.from) && (!range!.to || iso <= range!.to);
  }

  private toRow(item: ProcessTemplateItem): ProcessRow {
    const versions = item.versions || [];
    const activeVersion = versions.find(v => v.is_active) || versions[0];
    const isPublishedOnce = item.status !== 'Draft';

    return {
      item,
      versionLabel: `Phiên bản ${(item.version || '').replace(/^v/i, '').replace(/-draft$/i, '') || '1'}`,
      statusKey: PROCESS_STATUS_CONFIG[item.status]?.badge || 'draft',
      statusLabel: PROCESS_STATUS_CONFIG[item.status]?.label || item.status,
      triggerLabel: (item.triggerType && TRIGGER_LABELS[item.triggerType]) || EMPTY_TEXT,
      slaLabel: item.slaValue ? `${item.slaValue} ${item.slaUnit || ''}`.trim() : (item.sla || EMPTY_TEXT),
      createdDate: this.toDisplayDate(item.created_at || item.updatedAt || item.published_at),
      createdBy: item.created_by || versions[versions.length - 1]?.created_by || EMPTY_TEXT,
      publishedDate: isPublishedOnce ? this.toDisplayDate(item.published_at) : EMPTY_TEXT,
      publishedBy: isPublishedOnce ? (item.published_by || activeVersion?.created_by || EMPTY_TEXT) : EMPTY_TEXT,
      menuItems: this.buildMenuItems(item)
    };
  }

  /** 'DD/MM/YYYY HH:mm' → 'DD/MM/YYYY' */
  private toDisplayDate(value?: string): string {
    const m = /^(\d{2}\/\d{2}\/\d{4})/.exec(value || '');
    return m ? m[1] : EMPTY_TEXT;
  }

  /** 'DD/MM/YYYY HH:mm' → 'YYYY-MM-DD' */
  private toIsoDate(value?: string): string {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value || '');
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  private toTimestamp(value?: string): number {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/.exec(value || '');
    return m ? new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)).getTime() : 0;
  }

  // ===== Hành động =====
  /** "Tạo quy trình": mở Canvas Builder ở tab "Thông tin chung" */
  openCreate(): void {
    this.router.navigate(['/process/graph'], { queryParams: { mode: 'create', initType: 'blank' } });
  }

  openEdit(row: ProcessRow): void {
    this.router.navigate(['/process/graph'], { queryParams: { id: row.item.code } });
  }

  openView(row: ProcessRow): void {
    this.router.navigate(['/process/graph'], { queryParams: { id: row.item.code, version: row.item.version } });
  }

  private buildMenuItems(item: ProcessTemplateItem): ActionMenuItem[] {
    const items: ActionMenuItem[] = [];
    if (this.canCreate) {
      items.push({ key: 'clone', label: 'Nhân bản', icon: this.icons.copy });
    }
    if (this.canEdit) {
      items.push(item.status === 'Published'
        ? { key: 'stop', label: 'Dừng ban hành', icon: this.icons.stopPublish }
        : { key: 'publish', label: 'Ban hành' });
    }
    if (this.canDelete) {
      items.push({ key: 'delete', label: 'Xóa', icon: this.icons.delete, danger: true });
    }
    return items;
  }

  /** Menu ⋮ của một hàng → mở modal xác nhận tương ứng */
  onRowAction(key: string, row: ProcessRow): void {
    this.openActionModal(key as ProcessAction, [row]);
  }

  // ===== Thao tác hàng loạt (thanh "Đã chọn n" khi tích chọn) =====
  /** Hàng đang được chọn (giữ qua các trang) */
  get selectedRows(): ProcessRow[] {
    return this.filteredRows.filter(r => this.selection.isSelected(r));
  }

  /** Hàng chọn được để ban hành: Nháp hoặc Dừng ban hành */
  get publishableSelected(): ProcessRow[] {
    return this.selectedRows.filter(r => r.item.status !== 'Published');
  }

  /** Hàng chọn được để dừng ban hành: Đang ban hành */
  get stoppableSelected(): ProcessRow[] {
    return this.selectedRows.filter(r => r.item.status === 'Published');
  }

  // ===== Modal xác nhận =====
  openActionModal(action: ProcessAction, rows: ProcessRow[]): void {
    if (rows.length === 0) return;
    this.modalAction = action;
    this.modalRows = rows;
  }

  closeActionModal(): void {
    this.modalAction = null;
    this.modalRows = [];
  }

  confirmActionModal(): void {
    const codes = this.modalRows.map(r => r.item.code);
    switch (this.modalAction) {
      case 'clone': {
        const cloned = this.templateService.cloneTemplate(codes[0]);
        if (cloned) this.message.success(`Đã nhân bản thành bản nháp [${cloned.code}].`);
        break;
      }
      case 'publish': {
        const now = this.formatNow();
        codes.forEach(code => this.templateService.updateTemplate(code, { status: 'Published', published_at: now }));
        this.message.success(`Đã ban hành ${codes.length} quy trình.`);
        break;
      }
      case 'stop':
        codes.forEach(code => this.templateService.updateTemplate(code, { status: 'Inactive' }));
        this.message.success(`Đã dừng ban hành ${codes.length} quy trình.`);
        break;
      case 'delete': {
        const failed = codes
          .map(code => this.templateService.deleteTemplate(code))
          .filter(res => !res.success);
        failed.length
          ? failed.forEach(res => this.message.error(res.message))
          : this.message.success(`Đã xóa ${codes.length} quy trình.`);
        break;
      }
    }
    // Bỏ chọn các hàng vừa thao tác
    this.modalRows.forEach(r => this.selection.toggle(r, false));
    this.closeActionModal();
  }

  /** 'DD/MM/YYYY HH:mm' của thời điểm hiện tại */
  private formatNow(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
}
