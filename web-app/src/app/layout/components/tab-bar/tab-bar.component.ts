import { Component } from '@angular/core';
import { RbacService } from '@core/rbac';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent {
  tabs = [
    { label: '🎨 BPMN Canvas', path: '/templates/graph' },
    { label: '📋 Quản lý Template', path: '/templates/templates-management' },
    { label: '🧩 Action Library', path: '/templates/action-library' },
    { label: '📊 Giám sát Flow', path: '/instances/monitor' },
    { label: '☑️ Task của tôi', path: '/tasks/my-tasks' },
    { label: '📈 Dashboard SLA', path: '/reports/dashboard' },
    { label: '⚙️ Cấu hình SLA', path: '/settings/sla-escalation' },
    { label: '📁 Master Data', path: '/master-data/subscribers' },
    { label: '🛡️ Phân quyền Admin', path: '/admin/organization' }
  ];

  constructor(public rbacService: RbacService) {}
}
