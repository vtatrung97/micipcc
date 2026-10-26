import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sla-badge',
  templateUrl: './sla-badge.component.html',
  styleUrls: ['./sla-badge.component.scss']
})
export class SlaBadgeComponent {
  @Input() status: 'normal' | 'warning' | 'danger' | 'overdue' | 'success' = 'normal';
  @Input() count?: number;
  @Input() text?: string;
  @Input() isPulse: boolean = false;
  @Input() showDot: boolean = true;
}
