import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TemplateService, ProcessTemplateItem } from '@core/services/ticket-call-flows/template.service';
import { ProcessCategoryService } from '@core/services/ticket-call-flows/process-category.service';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu.component';
import { TableSelection } from '@shared/util/table-selection';
import {
  ProcessAdvancedFilter,
  AdvancedFilterOptions,
  EMPTY_ADVANCED_FILTER,
  countAdvancedFilter,
  DateRange,
  hasDateRange
} from './components/advanced-filter-drawer/advanced-filter-drawer.component';
import { PROCESS_STATUS_CONFIG } from './config/process-status.config';
import { ProcessRow } from './models/process-row.model';
import { ProcessAction } from './components/process-action-modal/process-action-modal.component';
import { ProcessCloneValue } from './components/process-clone-modal/process-clone-modal.component';
import {
  PROCESS_COLUMNS,
  PROCESS_HIDDEN_COLUMNS_STORAGE_KEY,
  ProcessColumn,
  ProcessColumnKey
} from './config/process-columns.config';

type StatusFilter = '' | 'Published' | 'Draft';

/** 4 loại kích hoạt cố định (cột bảng + bộ lọc nâng cao) */
const TRIGGER_LABELS: Record<string, string> = {
  MANUAL: 'Thủ công',
  AUTO: 'Tự động',
  SCHEDULE: 'Lập lịch',
  HYBRID: 'Hybrid'
};

const SEARCH_MAX_LENGTH = 255;

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
  /** Từ khoá đang áp dụng: chỉ đổi khi nhấn Enter hoặc xoá trắng ô tìm kiếm */
  private appliedKeyword: string = '';
  readonly searchMaxLength = SEARCH_MAX_LENGTH;
  statusFilter: StatusFilter = '';

  showAdvancedFilter: boolean = false;
  advancedFilter: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };

  page: number = 1;
  pageSize: number = 10;

  /** Modal xác nhận thao tác (ban hành / dừng ban hành / xóa); null = đóng */
  modalAction: ProcessAction | null = null;
  modalRows: ProcessRow[] = [];
  /** Quy trình đang mở popup Nhân bản */
  cloneSource: ProcessTemplateItem | null = null;

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
    bulkStop: 'assets/icons/processx/btn-stop-publish.svg',
    bulkPublish: 'assets/icons/processx/btn-publish.svg',
    delete: 'assets/icons/processx/trash-danger.svg'
  };

  /** Hàng đã lọc + sắp xếp (tính lại khi dữ liệu hoặc bộ lọc đổi) */
  filteredRows: ProcessRow[] = [];
  /** Phiên bản đang tồn tại thực tế (cho drawer Bộ lọc nâng cao) */
  filterOptions: AdvancedFilterOptions = { categories: [], triggers: [], creators: [], updaters: [] };
  pagedRows: ProcessRow[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private message: NzMessageService,
    private categoryService: ProcessCategoryService
  ) {}

  ngOnInit(): void {
    this.templateService.templates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        this.allTemplates = list || [];
        this.filterOptions = this.buildFilterOptions();
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
    return true;
  }

  get canEdit(): boolean {
    return true;
  }

  get canDelete(): boolean {
    return true;
  }

  // ===== Lọc / sắp xếp / phân trang =====
  get advancedFilterCount(): number {
    return countAdvancedFilter(this.advancedFilter);
  }

  // ===== Ẩn / hiện cột (nút "Sắp xếp") =====
  /** Cột cho phép ẩn (bỏ Mã + Tên quy trình) */
  private readonly hideableKeys: ProcessColumnKey[] = PROCESS_COLUMNS.filter(c => !c.locked).map(c => c.key);

  isColumnVisible(key: ProcessColumnKey): boolean {
    return !this.hiddenColumns.has(key);
  }

  get isAllColumnsVisible(): boolean {
    return this.hiddenColumns.size === 0;
  }

  get isSomeColumnsVisible(): boolean {
    return this.hiddenColumns.size > 0 && this.hiddenColumns.size < this.hideableKeys.length;
  }

  toggleColumn(key: ProcessColumnKey, visible: boolean): void {
    if (!this.hideableKeys.includes(key)) return;
    visible ? this.hiddenColumns.delete(key) : this.hiddenColumns.add(key);
    this.saveHiddenColumns();
  }

  toggleAllColumns(visible: boolean): void {
    this.hiddenColumns = visible ? new Set() : new Set(this.hideableKeys);
    this.saveHiddenColumns();
  }

  /** Mỗi người dùng một cấu hình ẩn / hiện cột */
  private get hiddenColumnsStorageKey(): string {
    return ``;
  }

  private loadHiddenColumns(): Set<ProcessColumnKey> {
    try {
      const raw = JSON.parse(localStorage.getItem(this.hiddenColumnsStorageKey) || '[]');
      const known = new Set(PROCESS_COLUMNS.filter(c => !c.locked).map(c => c.key));
      return new Set((Array.isArray(raw) ? raw : []).filter((k: ProcessColumnKey) => known.has(k)));
    } catch {
      return new Set();
    }
  }

  private saveHiddenColumns(): void {
    try {
      localStorage.setItem(this.hiddenColumnsStorageKey, JSON.stringify(Array.from(this.hiddenColumns)));
    } catch {}
  }

  /**
   * Lựa chọn cho bộ lọc nâng cao, tính lại chỉ khi danh sách đổi (getter trả mảng mới làm ant-select dựng lại option).
   * Nhóm quy trình sắp alphabet; người tạo / cập nhật lấy từ dữ liệu.
   */
  private buildFilterOptions(): AdvancedFilterOptions {
    const toOptions = (values: string[]) =>
      Array.from(new Set(values.filter(v => v && v !== EMPTY_TEXT)))
        .sort((a, b) => a.localeCompare(b, 'vi'))
        .map(v => ({ value: v, label: v }));
    return {
      categories: [...this.categoryService.categories]
        .sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }))
        .map(c => ({ value: c, label: c })),
      triggers: Object.entries(TRIGGER_LABELS).map(([value, label]) => ({ value, label })),
      creators: toOptions(this.allTemplates.map(t => this.creatorOf(t))),
      updaters: toOptions(this.allTemplates.map(t => this.updaterOf(t)))
    };
  }

  private creatorOf(item: ProcessTemplateItem): string {
    const versions = item.versions || [];
    return item.created_by || versions[versions.length - 1]?.created_by || '';
  }

  /** Chưa có người cập nhật thì coi người tạo là người cập nhật gần nhất */
  private updaterOf(item: ProcessTemplateItem): string {
    return item.updated_by || this.creatorOf(item);
  }

  /** Nhấn Enter → tìm theo từ khoá (bỏ khoảng trắng đầu / cuối, không phân biệt hoa thường) */
  onSearch(): void {
    this.appliedKeyword = this.searchKeyword.trim().toLowerCase();
    this.page = 1;
    this.refresh();
  }

  /** Xoá trắng ô tìm kiếm → hiện lại toàn bộ, không cần nhấn Enter */
  onSearchChange(value: string): void {
    if (!value && this.appliedKeyword) this.onSearch();
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
    const keyword = this.appliedKeyword;
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
      && (!f.category || item.category === f.category)
      && (!f.status || item.status === f.status)
      && (!f.triggerType || item.triggerType === f.triggerType)
      && (!f.createdBy || this.creatorOf(item) === f.createdBy)
      && (!f.updatedBy || this.updaterOf(item) === f.updatedBy)
      && this.inRange(item.created_at || item.updatedAt, f.createdRange)
      && this.inRange(this.updatedAtOf(item), f.updatedRange)
      && this.inRange(item.status !== 'Draft' ? item.published_at : undefined, f.publishedRange);
  }

  /** Chưa cập nhật lần nào thì lấy ngày tạo */
  private updatedAtOf(item: ProcessTemplateItem): string | undefined {
    return item.updatedAt || item.created_at || item.published_at;
  }

  /** Ngày ('DD/MM/YYYY HH:mm[:ss]') nằm trong khoảng [from, to] (YYYY-MM-DD, tính cả 2 đầu) */
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
      versionLabel: this.versionLabelOf(item.version),
      statusKey: PROCESS_STATUS_CONFIG[item.status]?.badge || 'draft',
      statusLabel: PROCESS_STATUS_CONFIG[item.status]?.label || item.status,
      triggerLabel: (item.triggerType && TRIGGER_LABELS[item.triggerType]) || EMPTY_TEXT,
      slaLabel: this.slaLabelOf(item),
      createdDate: this.toDisplayDate(item.created_at || item.updatedAt || item.published_at),
      createdBy: this.creatorOf(item) || EMPTY_TEXT,
      updatedDate: this.toDisplayDate(this.updatedAtOf(item)),
      updatedBy: this.updaterOf(item) || EMPTY_TEXT,
      publishedDate: isPublishedOnce ? this.toDisplayDate(item.published_at) : EMPTY_TEXT,
      publishedBy: isPublishedOnce ? (item.published_by || activeVersion?.created_by || EMPTY_TEXT) : EMPTY_TEXT,
      menuItems: this.buildMenuItems(item)
    };
  }

  /** Thời hạn xử lý dạng "5 ngày" (số + đơn vị viết thường) */
  private slaLabelOf(item: ProcessTemplateItem): string {
    if (item.slaValue) return `${item.slaValue} ${(item.slaUnit || '').toLowerCase()}`.trim();
    const sla = item.sla || '';
    return /^\d+\s+\p{L}+$/u.test(sla) ? sla.toLowerCase() : (sla || EMPTY_TEXT);
  }

  /** Phiên bản gốc (V1 hoặc chưa có) → "Gốc"; bản nâng từ bản gốc → "Phiên bản N" (V2 = phiên bản 1) */
  private versionLabelOf(version?: string): string {
    const major = parseInt((version || '').replace(/^v/i, ''), 10);
    return !major || major <= 1 ? 'Gốc' : `Phiên bản ${major - 1}`;
  }

  /** 'DD/MM/YYYY HH:mm[:ss]' → 'DD/MM/YYYY HH:mm:ss' (thiếu giây thì :00) */
  private toDisplayDate(value?: string): string {
    const m = /^(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2})(?::(\d{2}))?)?/.exec(value || '');
    if (!m) return EMPTY_TEXT;
    return `${m[1]} ${m[2] || '00:00'}:${m[3] || '00'}`;
  }

  /** 'DD/MM/YYYY HH:mm' → 'YYYY-MM-DD' */
  private toIsoDate(value?: string): string {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value || '');
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  private toTimestamp(value?: string): number {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value || '');
    return m ? new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)).getTime() : 0;
  }

  // ===== Hành động =====
  /** "Tạo quy trình": mở Canvas Builder ở tab "Thông tin chung" */
  openCreate(): void {
    this.router.navigate(['/procedure-management/graph'], { queryParams: { mode: 'create', initType: 'blank' } });
  }

  openEdit(row: ProcessRow): void {
    this.router.navigate(['/procedure-management/graph'], { queryParams: { id: row.item.code } });
  }

  /** Xem: mở màn thiết kế ở chế độ chỉ xem (khoá mọi ô, không thao tác) */
  openView(row: ProcessRow): void {
    this.router.navigate(['/procedure-management/graph'], { queryParams: { id: row.item.code, mode: 'view' } });
  }

  /**
   * Menu ⋮ luôn 3 mục cố định: Nhân bản · Dừng ban hành · Xóa.
   * Mục không áp dụng thì mờ đi: Dừng ban hành chỉ khi Đang ban hành, Xóa chỉ khi Nháp (hoặc thiếu quyền).
   * Ban hành chỉ làm hàng loạt bằng nút trên thanh công cụ.
   */
  private buildMenuItems(item: ProcessTemplateItem): ActionMenuItem[] {
    return [
      { key: 'clone', label: 'Nhân bản', icon: this.icons.copy, disabled: !this.canCreate },
      { key: 'stop', label: 'Dừng ban hành', icon: this.icons.stopPublish, disabled: !this.canEdit || item.status !== 'Published' },
      { key: 'delete', label: 'Xóa', icon: this.icons.delete, danger: true, disabled: !this.canDelete || item.status !== 'Draft' },
    ];
  }

  /** Menu ⋮ của một hàng → Nhân bản mở popup nhập Tên / Mã, còn lại mở modal xác nhận */
  onRowAction(key: string, row: ProcessRow): void {
    if (key === 'clone') {
      this.cloneSource = row.item;
      return;
    }
    this.openActionModal(key as ProcessAction, [row]);
  }

  /** Lưu bản sao trạng thái Nháp với Tên / Mã người dùng nhập */
  confirmClone(value: ProcessCloneValue): void {
    if (!this.cloneSource) return;
    const cloned = this.templateService.cloneTemplate(this.cloneSource.code, value.code, value.name);
    if (cloned) this.message.success(`Đã nhân bản thành bản nháp [${cloned.code}].`);
    this.cloneSource = null;
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

  /** 'DD/MM/YYYY HH:mm:ss' của thời điểm hiện tại */
  private formatNow(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
}
