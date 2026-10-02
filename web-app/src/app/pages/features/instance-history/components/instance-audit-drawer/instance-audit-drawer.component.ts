import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FlowHistoryItem, AuditTrailDetail } from '@core/services/flow-instance.service';

@Component({
  selector: 'app-instance-audit-drawer',
  templateUrl: './instance-audit-drawer.component.html',
  styleUrls: ['./instance-audit-drawer.component.scss']
})
export class InstanceAuditDrawerComponent {
  @Input() visible: boolean = false;
  @Input() instance: FlowHistoryItem | null = null;
  @Input() auditDetail: AuditTrailDetail | null = null;
  @Input() isLoadingAudit: boolean = false;
  @Input() activeTab: 'timeline' | 'variables' = 'timeline';

  @Output() onClose = new EventEmitter<void>();

  handleClose(): void {
    this.onClose.emit();
  }

  setTab(tab: 'timeline' | 'variables'): void {
    this.activeTab = tab;
  }

  formatDateTime(dateStr?: string | Date): string {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-cancelled';
      case 'FAILED': return 'badge-failed';
      case 'TERMINATED': return 'badge-terminated';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Thành công';
      case 'CANCELLED': return 'Đã hủy';
      case 'FAILED': return 'Thất bại';
      case 'TERMINATED': return 'Bị ngắt quãng';
      default: return status || '--';
    }
  }
}
