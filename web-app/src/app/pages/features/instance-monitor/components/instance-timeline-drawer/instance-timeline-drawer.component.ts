import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FlowInstanceItem, FlowInstanceStatus, FlowTimelineItem } from '@core/services/flow-instance.service';

@Component({
  selector: 'app-instance-timeline-drawer',
  templateUrl: './instance-timeline-drawer.component.html',
  styleUrls: ['./instance-timeline-drawer.component.scss']
})
export class InstanceTimelineDrawerComponent {
  @Input() visible: boolean = false;
  @Input() instance: FlowInstanceItem | null = null;
  @Input() timelineItems: FlowTimelineItem[] = [];
  @Input() isLoadingTimeline: boolean = false;
  @Input() retryingInstanceId: string | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<{ instance: FlowInstanceItem; stepId?: string }>();
  @Output() onCancelFlow = new EventEmitter<FlowInstanceItem>();

  handleClose(): void {
    this.onClose.emit();
  }

  handleRetry(stepId?: string): void {
    if (!this.instance) return;
    this.onRetry.emit({ instance: this.instance, stepId });
  }

  handleCancelFlow(): void {
    if (!this.instance) return;
    this.onCancelFlow.emit(this.instance);
  }

  formatDateTime(dateStr?: string | Date): string {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  getStatusBadgeClass(status: FlowInstanceStatus): string {
    switch (status) {
      case 'RUNNING': return 'status-running';
      case 'OVERDUE': return 'status-waiting';
      case 'FAILED':
      case 'EXCEPTION': return 'status-error';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getStatusLabel(status: FlowInstanceStatus): string {
    switch (status) {
      case 'RUNNING': return 'Đang chạy';
      case 'OVERDUE': return 'Quá hạn SLA';
      case 'FAILED': return 'Thất bại / Lỗi';
      case 'EXCEPTION': return 'Sự cố ngoại lệ';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy luồng';
      default: return status;
    }
  }
}
