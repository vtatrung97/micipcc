import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  FlowInstanceService,
  SystemLogItem,
  SystemLogFilter,
  SystemLogSummary,
  LogLevel
} from '@core/services/flow-instance.service';

@Component({
  selector: 'app-instance-logs',
  templateUrl: './instance-logs.component.html',
  styleUrls: ['./instance-logs.component.scss']
})
export class InstanceLogsComponent implements OnInit, OnDestroy {
  // Dữ liệu từ API (Tuyệt đối không mock data)
  logs: SystemLogItem[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 15;
  pageSizeOptions: number[] = [15, 30, 50, 100];
  isLoading: boolean = false;
  errorMessage: string = '';

  // KPI Summary
  summary: SystemLogSummary = { total: 0, info: 0, warn: 0, error: 0, fatal: 0 };
  isLoadingSummary: boolean = false;

  // Bộ lọc Log hệ thống (FR-15)
  searchKeyword: string = '';
  selectedLevel: string = '';
  selectedModule: string = '';
  selectedService: string = '';
  fromDate: string = '';
  toDate: string = '';

  levelOptions = [
    { value: '', label: 'Tất cả cấp độ' },
    { value: 'INFO', label: 'INFO (Thông tin)' },
    { value: 'WARN', label: 'WARN (Cảnh báo)' },
    { value: 'ERROR', label: 'ERROR (Lỗi)' },
    { value: 'FATAL', label: 'FATAL (Nghiêm trọng)' },
    { value: 'DEBUG', label: 'DEBUG (Gỡ lỗi)' }
  ];

  moduleOptions = [
    { value: '', label: 'Tất cả phân hệ' },
    { value: 'M1: Template', label: 'M1: Template Engine' },
    { value: 'M2: Flow Engine', label: 'M2: Flow Instance' },
    { value: 'M3: Task', label: 'M3: Task Management' },
    { value: 'M4: Reports', label: 'M4: Reports & SLA' },
    { value: 'Security', label: 'Security & Auth' }
  ];

  serviceOptions = [
    { value: '', label: 'Tất cả dịch vụ' },
    { value: 'Engine Service', label: 'Engine Service' },
    { value: 'IPCC Gateway', label: 'IPCC Gateway' },
    { value: 'Notification Service', label: 'Notification Service' },
    { value: 'Webhook Worker', label: 'Webhook Worker' },
    { value: 'Audit Daemon', label: 'Audit Daemon' }
  ];

  // Live Stream Log (Tail -f)
  isLiveStreaming: boolean = false;
  private liveSub?: Subscription;

  // Modal xem chi tiết Log
  showLogDetailModal: boolean = false;
  selectedLog: SystemLogItem | null = null;
  copySuccess: boolean = false;

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
      this.loadLogs();
    });

    this.loadSummary();
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.liveSub) {
      this.liveSub.unsubscribe();
    }
  }

  loadLogs(silent: boolean = false): void {
    if (!silent) this.isLoading = true;
    this.errorMessage = '';

    const filter: SystemLogFilter = {
      search: this.searchKeyword.trim(),
      level: this.selectedLevel || undefined,
      module: this.selectedModule || undefined,
      service_name: this.selectedService || undefined,
      from_date: this.fromDate || undefined,
      to_date: this.toDate || undefined,
      page: this.currentPage,
      page_size: this.pageSize
    };

    this.flowInstanceService.getSystemLogs(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.logs = res?.items || [];
          this.totalCount = res?.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải Log hệ thống từ API:', err);
          this.errorMessage = 'Không thể lấy dữ liệu Log từ máy chủ.';
          this.isLoading = false;
        }
      });
  }

  loadSummary(): void {
    this.isLoadingSummary = true;
    this.flowInstanceService.getSystemLogSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sum) => {
          this.summary = sum || { total: 0, info: 0, warn: 0, error: 0, fatal: 0 };
          this.isLoadingSummary = false;
        },
        error: (err) => {
          console.warn('Không thể nạp Log summary:', err);
          this.isLoadingSummary = false;
        }
      });
  }

  toggleLiveStreaming(): void {
    this.isLiveStreaming = !this.isLiveStreaming;
    if (this.liveSub) {
      this.liveSub.unsubscribe();
    }

    if (this.isLiveStreaming) {
      this.liveSub = timer(3000, 3000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadLogs(true);
          this.loadSummary();
        });
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchKeyword);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedLevel = '';
    this.selectedModule = '';
    this.selectedService = '';
    this.fromDate = '';
    this.toDate = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  get hasActiveFilter(): boolean {
    return !!(this.searchKeyword || this.selectedLevel || this.selectedModule || this.selectedService || this.fromDate || this.toDate);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadLogs();
  }

  openLogDetail(log: SystemLogItem): void {
    this.selectedLog = log;
    this.showLogDetailModal = true;
    this.copySuccess = false;
  }

  closeLogDetail(): void {
    this.showLogDetailModal = false;
    this.selectedLog = null;
    this.copySuccess = false;
  }

  copyJson(): void {
    if (!this.selectedLog) return;
    const jsonStr = JSON.stringify(this.selectedLog, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000);
    });
  }

  getLevelClass(level: LogLevel): string {
    switch (level) {
      case 'INFO': return 'level-info';
      case 'WARN': return 'level-warn';
      case 'ERROR': return 'level-error';
      case 'FATAL': return 'level-fatal';
      case 'DEBUG': return 'level-debug';
      default: return 'level-default';
    }
  }

  formatTimestamp(dateStr?: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const padMs = (n: number) => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : String(n));
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${padMs(date.getMilliseconds())}`;
  }
}
