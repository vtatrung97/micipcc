import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  FlowInstanceService,
  FlowInstanceItem,
  FlowInstanceSummary,
  FlowTimelineItem,
  FlowInstanceFilter,
  ProcessTemplateOption,
  AssigneeOption,
  FlowInstanceStatus
} from '@core/services/flow-instance.service';

@Component({
  selector: 'app-instance-monitor',
  templateUrl: './instance-monitor.component.html',
  styleUrls: ['./instance-monitor.component.scss']
})
export class InstanceMonitorComponent implements OnInit, OnDestroy {
  // Dữ liệu bảng và phân trang (Được lấy từ API, tuyệt đối không tạo mock)
  instances: FlowInstanceItem[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Khối chỉ số KPI Summary (FR-11)
  summary: FlowInstanceSummary = {
    total: 0,
    running: 0,
    completed: 0,
    overdue: 0,
    failed: 0
  };
  isLoadingSummary: boolean = false;

  // Bộ lọc tìm kiếm (US-03, FR-11, FR-13, FR-14)
  searchKeyword: string = '';
  selectedTemplateId: string = '';
  selectedStatus: string = ''; // '' | 'RUNNING' | 'COMPLETED' | 'OVERDUE' | 'FAILED'
  selectedOwner: string = '';
  fromDate: string = '';
  toDate: string = '';
  selectedTriggerSource: string = '';

  // Danh mục phục vụ Filter Bar (Lấy trực tiếp từ API)
  templateOptions: ProcessTemplateOption[] = [];
  assigneeOptions: AssigneeOption[] = [];
  triggerSources: string[] = ['ALL', 'Zalo', 'Facebook', 'SMS', 'IPCC 2.0', 'Webhook', 'MANUAL'];

  get templateSelectOptions() {
    return [
      { value: '', label: 'Tất cả quy trình' },
      ...this.templateOptions.map(t => ({ value: t.id, label: t.name }))
    ];
  }

  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'RUNNING', label: 'Đang chạy (RUNNING)' },
    { value: 'COMPLETED', label: 'Đã hoàn thành (COMPLETED)' },
    { value: 'OVERDUE', label: 'Quá hạn (OVERDUE SLA)' },
    { value: 'FAILED', label: 'Ngoại lệ / Gặp sự cố (FAILED)' }
  ];

  get assigneeSelectOptions() {
    return [
      { value: '', label: 'Tất cả người / bộ phận' },
      ...this.assigneeOptions.map(a => ({ value: a.id, label: `${a.name} - ${a.department}` }))
    ];
  }

  triggerSourceOptions = [
    { value: '', label: 'Tất cả nguồn kích hoạt' },
    { value: 'Zalo', label: 'Zalo' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'SMS', label: 'SMS Brandname' },
    { value: 'IPCC 2.0', label: 'IPCC 2.0 (Tổng đài)' },
    { value: 'Webhook', label: 'Webhook API' },
    { value: 'MANUAL', label: 'Khởi tạo thủ công' }
  ];

  // Công cụ thời gian thực (Real-time auto refresh)
  autoRefreshEnabled: boolean = true;
  refreshIntervalSeconds: number = 10;
  refreshIntervalOptions: number[] = [5, 10, 30, 60];
  lastUpdatedTime: string = '';
  isRefreshing: boolean = false;

  // Drawer xem Timeline tuần tự và chi tiết bước (FR-12, US-03)
  showTimelineDrawer: boolean = false;
  selectedInstance: FlowInstanceItem | null = null;
  timelineItems: FlowTimelineItem[] = [];
  isLoadingTimeline: boolean = false;

  // Modal Xử lý sự cố: Hủy luồng tiến trình (FR-14, US-22)
  showCancelModal: boolean = false;
  targetCancelInstance: FlowInstanceItem | null = null;
  cancelReason: string = '';
  isCancelling: boolean = false;

  // State theo dõi Retry đang chạy
  retryingInstanceId: string | null = null;

  private searchSubject = new Subject<string>();
  private refreshTimerSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private flowInstanceService: FlowInstanceService) {}

  ngOnInit(): void {
    // 1. Lắng nghe debounce search input
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadInstances();
    });

    // 2. Tải danh mục dropdown cho bộ lọc từ API
    this.loadFilterOptions();

    // 3. Tải KPI Summary và bảng dữ liệu ban đầu
    this.loadSummary();
    this.loadInstances();

    // 4. Khởi chạy cơ chế tự động làm mới thời gian thực
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshTimerSub) {
      this.refreshTimerSub.unsubscribe();
    }
  }

  // ==========================================================================
  // DATA FETCHING & API INTEGRATION (TUYỆT ĐỐI KHÔNG TẠO DỮ LIỆU GIẢ LẬP)
  // ==========================================================================

  loadInstances(silent: boolean = false): void {
    if (!silent) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    const filter: FlowInstanceFilter = {
      search: this.searchKeyword.trim(),
      template_id: this.selectedTemplateId || undefined,
      status: this.selectedStatus || undefined,
      current_owner: this.selectedOwner || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined,
      trigger_source: this.selectedTriggerSource || undefined,
      page: this.currentPage,
      page_size: this.pageSize
    };

    this.flowInstanceService.getInstances(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.instances = res?.items || [];
          this.totalCount = res?.total || 0;
          this.lastUpdatedTime = this.getCurrentTimeStr();
          this.isLoading = false;
          this.isRefreshing = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách Flow Instances từ API:', err);
          this.errorMessage = 'Không thể tải dữ liệu tiến trình từ máy chủ. Vui lòng kiểm tra kết nối API.';
          this.isLoading = false;
          this.isRefreshing = false;
        }
      });
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.flowInstanceService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary = data || { total: 0, running: 0, completed: 0, overdue: 0, failed: 0 };
          this.isLoadingSummary = false;
        },
        error: (err) => {
          console.warn('Không thể tải KPI Summary từ API:', err);
          this.isLoadingSummary = false;
        }
      });
  }

  loadFilterOptions(): void {
    this.flowInstanceService.getTemplateOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          this.templateOptions = templates || [];
        },
        error: (err) => console.warn('Không thể nạp Template options từ API:', err)
      });

    this.flowInstanceService.getAssigneeOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignees) => {
          this.assigneeOptions = assignees || [];
        },
        error: (err) => console.warn('Không thể nạp Assignee options từ API:', err)
      });
  }

  // ==========================================================================
  // REAL-TIME AUTO REFRESH LOGIC
  // ==========================================================================

  setupAutoRefresh(): void {
    if (this.refreshTimerSub) {
      this.refreshTimerSub.unsubscribe();
    }

    if (!this.autoRefreshEnabled) {
      return;
    }

    const intervalMs = this.refreshIntervalSeconds * 1000;
    this.refreshTimerSub = timer(intervalMs, intervalMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isLoading && !this.isRefreshing) {
          this.isRefreshing = true;
          this.loadInstances(true);
          this.loadSummary();
        }
      });
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    this.setupAutoRefresh();
  }

  setRefreshInterval(seconds: number): void {
    this.refreshIntervalSeconds = seconds;
    if (this.autoRefreshEnabled) {
      this.setupAutoRefresh();
    }
  }

  manualRefresh(): void {
    this.isRefreshing = true;
    this.loadInstances(false);
    this.loadSummary();
  }

  // ==========================================================================
  // FILTERING & SEARCH HANDLERS
  // ==========================================================================

  onSearchChange(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadInstances();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = this.selectedStatus === status ? '' : status;
    this.currentPage = 1;
    this.loadInstances();
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedTemplateId = '';
    this.selectedStatus = '';
    this.selectedOwner = '';
    this.fromDate = '';
    this.toDate = '';
    this.selectedTriggerSource = '';
    this.currentPage = 1;
    this.loadInstances();
  }

  get hasActiveFilter(): boolean {
    return !!(
      this.searchKeyword ||
      this.selectedTemplateId ||
      this.selectedStatus ||
      this.selectedOwner ||
      this.fromDate ||
      this.toDate ||
      this.selectedTriggerSource
    );
  }

  // ==========================================================================
  // PAGINATION HANDLERS
  // ==========================================================================

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadInstances();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadInstances();
  }

  // ==========================================================================
  // TIMELINE & DETAIL DRAWER (FR-12, US-03)
  // ==========================================================================

  openTimeline(instance: FlowInstanceItem): void {
    this.selectedInstance = instance;
    this.showTimelineDrawer = true;
    this.isLoadingTimeline = true;
    this.timelineItems = [];

    this.flowInstanceService.getInstanceTimeline(instance.process_instance_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.timelineItems = items || [];
          this.isLoadingTimeline = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải Timeline tiến trình từ API:', err);
          this.isLoadingTimeline = false;
        }
      });
  }

  closeTimelineDrawer(): void {
    this.showTimelineDrawer = false;
    this.selectedInstance = null;
    this.timelineItems = [];
  }

  // ==========================================================================
  // XỬ LÝ SỰ CỐ: RETRY & CANCEL (FR-14, US-22)
  // ==========================================================================

  retryStep(instance: FlowInstanceItem, activityId?: string): void {
    if (this.retryingInstanceId) return;

    this.retryingInstanceId = instance.process_instance_id;
    this.flowInstanceService.retryStep(instance.process_instance_id, activityId || instance.activity_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.retryingInstanceId = null;
          alert(`Đã gửi yêu cầu Thử lại (Retry) bước [${instance.current_step_name}] cho Instance ${instance.process_instance_id}.`);
          this.manualRefresh();
          if (this.showTimelineDrawer && this.selectedInstance?.process_instance_id === instance.process_instance_id) {
            this.openTimeline(instance);
          }
        },
        error: (err) => {
          this.retryingInstanceId = null;
          console.error('Lỗi khi thực hiện Retry từ API:', err);
          alert('Không thể thực hiện Retry: ' + (err?.error?.message || 'Lỗi kết nối máy chủ.'));
        }
      });
  }

  openCancelModal(instance: FlowInstanceItem): void {
    this.targetCancelInstance = instance;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.targetCancelInstance = null;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.targetCancelInstance) return;
    if (!this.cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy luồng tiến trình.');
      return;
    }

    this.isCancelling = true;
    this.flowInstanceService.cancelInstance(this.targetCancelInstance.process_instance_id, this.cancelReason.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCancelling = false;
          alert(`Đã hủy thành công Instance ${this.targetCancelInstance?.process_instance_id}.`);
          this.closeCancelModal();
          this.manualRefresh();
          if (this.showTimelineDrawer) {
            this.closeTimelineDrawer();
          }
        },
        error: (err) => {
          this.isCancelling = false;
          console.error('Lỗi khi hủy tiến trình qua API:', err);
          alert('Không thể hủy tiến trình: ' + (err?.error?.message || 'Lỗi máy chủ.'));
        }
      });
  }

  // ==========================================================================
  // HELPER FORMATTERS & UTILITIES
  // ==========================================================================

  getStatusBadgeClass(status: FlowInstanceStatus): string {
    switch (status) {
      case 'RUNNING': return 'badge-running';
      case 'COMPLETED': return 'badge-completed';
      case 'OVERDUE': return 'badge-overdue';
      case 'FAILED':
      case 'EXCEPTION': return 'badge-failed';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'badge-default';
    }
  }

  getStatusLabel(status: FlowInstanceStatus): string {
    switch (status) {
      case 'RUNNING': return 'Đang chạy';
      case 'COMPLETED': return 'Hoàn thành';
      case 'OVERDUE': return 'Quá hạn SLA';
      case 'FAILED': return 'Ngoại lệ / Lỗi';
      case 'EXCEPTION': return 'Sự cố ngoại lệ';
      case 'CANCELLED': return 'Đã hủy luồng';
      default: return status;
    }
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  getSlaCountdown(dueAt?: string, status?: FlowInstanceStatus): { text: string; isOverdue: boolean } {
    if (status === 'COMPLETED') return { text: 'Đúng hạn cam kết', isOverdue: false };
    if (status === 'OVERDUE') return { text: 'Đã quá hạn SLA', isOverdue: true };
    if (!dueAt) return { text: 'Không áp dụng', isOverdue: false };

    const dueDate = new Date(dueAt).getTime();
    const now = new Date().getTime();
    const diffMs = dueDate - now;

    if (diffMs <= 0) return { text: 'Quá hạn SLA', isOverdue: true };

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) return { text: `Còn ${minutes} phút`, isOverdue: false };
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;
    return { text: `Còn ${hours}h ${remainMinutes}p`, isOverdue: false };
  }

  getCurrentTimeStr(): string {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
}
