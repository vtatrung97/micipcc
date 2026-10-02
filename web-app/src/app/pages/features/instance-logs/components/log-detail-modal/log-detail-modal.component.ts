import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SystemLogItem, LogLevel } from '@core/services/flow-instance.service';

@Component({
  selector: 'app-log-detail-modal',
  templateUrl: './log-detail-modal.component.html',
  styleUrls: ['./log-detail-modal.component.scss']
})
export class LogDetailModalComponent {
  @Input() visible: boolean = false;
  @Input() log: SystemLogItem | null = null;
  @Output() onClose = new EventEmitter<void>();

  copySuccess: boolean = false;

  handleClose(): void {
    this.copySuccess = false;
    this.onClose.emit();
  }

  copyJson(): void {
    if (!this.log) return;
    const jsonStr = JSON.stringify(this.log, null, 2);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        this.copySuccess = true;
        setTimeout(() => this.copySuccess = false, 2000);
      });
    }
  }

  getLevelClass(level: LogLevel): string {
    switch (level) {
      case 'INFO': return 'level-info';
      case 'WARN': return 'level-warn';
      case 'ERROR': return 'level-error';
      case 'DEBUG': return 'level-debug';
      default: return '';
    }
  }

  formatTimestamp(ts?: string | Date): string {
    if (!ts) return '--';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
  }
}
