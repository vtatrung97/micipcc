import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  FlowInstanceService,
  FlowHistoryItem,
  FlowHistoryFilter,
  AuditTrailDetail,
  ProcessTemplateOption
} from '@core/services/flow-instance.service';

@Component({
  selector: 'app-instance-history',
  templateUrl: './instance-history.component.html',
  styleUrls: ['./instance-history.component.scss']
})
export class InstanceHistoryComponent implements OnInit, OnDestroy {
  // Dữ liệu từ API (Không mock data)
  historyItems: FlowHistoryItem[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Bộ lọc lịch sử & Audit
  searchKeyword: string = '';
  selectedTemplateId: string = '';
  selectedFinalStatus: string = '';
  selectedSlaCompliance: string = '';
  fromDate: string = '';
  toDate: string = '';

  // Options
  templateOptions: ProcessTemplateOption[] = [];

  get templateSelectOptions() {
    return [
      { value: '', label: 'Tất cả quy trình' },
      ...this.templateOptions.map(t => ({ value: t.id, label: t.name }))
    ];
  }

  finalStatusOptions = [
    { value: '', label: 'Tất cả kết quả' },
    { value: 'COMPLETED', label: 'Hoàn tất thành công' },
    { value: 'CANCELLED', label: 'Đã hủy luồng' },
    { value: 'FAILED', label: 'Lỗi kết thúc' },
    { value: 'TERMINATED', label: 'Cưỡng bức dừng' }
  ];

  slaOptions = [
    { value: '', label: 'Tất cả SLA' },
    { value: 'MET', label: 'Đạt cam kết SLA' },
    { value: 'BREACHED', label: 'Vi phạm / Quá hạn SLA' }
  ];

  // Drawer xem Audit Trail & Biến dữ liệu (US-23)
  showAuditDrawer: boolean = false;
  selectedItem: FlowHistoryItem | null = null;
  auditDetail: AuditTrailDetail | null = null;
  isLoadingAudit: boolean = false;
  activeDrawerTab: 'timeline' | 'variables' = 'timeline';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private flowInstanceService: FlowInstanceService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadHistory();
    });

    this.loadTemplates();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: FlowHistoryFilter = {
      search: this.searchKeyword.trim(),
      template_id: this.selectedTemplateId || undefined,
      final_status: this.selectedFinalStatus || undefined,
      sla_compliance: this.selectedSlaCompliance || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined,
      page: this.currentPage,
      page_size: this.pageSize
    };

    this.flowInstanceService.getExecutionHistory(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.historyItems = res?.items || [];
          this.totalCount = res?.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải Lịch sử thực thi từ API:', err);
          this.errorMessage = 'Không thể kết nối đến máy chủ lấy lịch sử thực thi.';
          this.isLoading = false;
        }
      });
  }

  loadTemplates(): void {
    this.flowInstanceService.getTemplateOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tpls) => this.templateOptions = tpls || [],
        error: (err) => console.warn('Không thể nạp Template options:', err)
      });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadHistory();
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedTemplateId = '';
    this.selectedFinalStatus = '';
    this.selectedSlaCompliance = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadHistory();
  }

  get hasActiveFilter(): boolean {
    return !!(this.searchKeyword || this.selectedTemplateId || this.selectedFinalStatus || this.selectedSlaCompliance || this.fromDate || this.toDate);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadHistory();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadHistory();
  }

  openAuditDrawer(item: FlowHistoryItem, defaultTab: 'timeline' | 'variables' = 'timeline'): void {
    this.selectedItem = item;
    this.activeDrawerTab = defaultTab;
    this.showAuditDrawer = true;
    this.isLoadingAudit = true;
    this.auditDetail = null;

    this.flowInstanceService.getAuditTrail(item.process_instance_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.auditDetail = data;
          this.isLoadingAudit = false;
        },
        error: (err) => {
          console.error('Lỗi khi nạp Audit Trail từ API:', err);
          this.isLoadingAudit = false;
        }
      });
  }

  closeAuditDrawer(): void {
    this.showAuditDrawer = false;
    this.selectedItem = null;
    this.auditDetail = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-cancelled';
      case 'FAILED': return 'badge-failed';
      case 'TERMINATED': return 'badge-terminated';
      default: return 'badge-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Hoàn tất';
      case 'CANCELLED': return 'Đã hủy luồng';
      case 'FAILED': return 'Lỗi kết thúc';
      case 'TERMINATED': return 'Cưỡng bức dừng';
      default: return status;
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
