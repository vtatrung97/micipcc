import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <nav class="breadcrumb-container" aria-label="Breadcrumb">
      <span class="home-crumb">🏠 Flow System</span>
      <ng-container *ngFor="let item of items; let last = last">
        <span class="separator">/</span>
        <span class="crumb-item" [class.active]="last">{{ item }}</span>
      </ng-container>
    </nav>
  `,
  styles: [`
    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #8c8c8c;
      padding: 4px 0;
    }
    .separator {
      color: #bfbfbf;
    }
    .crumb-item.active {
      color: #1677ff;
      font-weight: 600;
    }
  `]
})
export class BreadcrumbsComponent {
  @Input() items: string[] = ['IPCC 2.0'];
}
