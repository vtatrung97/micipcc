import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sla-badge',
  template: `
    <span class="sla-badge" [class.pulse]="isPulse" [attr.data-status]="status">
      <span class="bullet" *ngIf="showDot">●</span>
      <span class="text">{{ text || (count !== undefined ? count : status) }}</span>
    </span>
  `,
  styles: [`
    .sla-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      line-height: 1;
    }
    .sla-badge[data-status="normal"], .sla-badge[data-status="success"] {
      background: #f6ffed;
      color: #389e0d;
      border: 1px solid #b7eb8f;
    }
    .sla-badge[data-status="warning"] {
      background: #fffbe6;
      color: #d46b08;
      border: 1px solid #ffe58f;
    }
    .sla-badge[data-status="danger"], .sla-badge[data-status="overdue"] {
      background: #fff1f0;
      color: #cf1322;
      border: 1px solid #ffa39e;
    }
    .sla-badge.pulse {
      animation: slaPulse 1.6s infinite ease-in-out;
    }
    @keyframes slaPulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.6); }
      70% { box-shadow: 0 0 0 5px rgba(255, 77, 79, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
    }
  `]
})
export class SlaBadgeComponent {
  @Input() status: 'normal' | 'warning' | 'danger' | 'overdue' | 'success' = 'normal';
  @Input() count?: number;
  @Input() text?: string;
  @Input() isPulse: boolean = false;
  @Input() showDot: boolean = true;
}
