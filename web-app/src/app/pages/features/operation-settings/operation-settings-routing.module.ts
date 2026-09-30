import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationSettingsComponent } from './operation-settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sla-escalation',
    pathMatch: 'full'
  },
  {
    path: 'sla-escalation',
    component: OperationSettingsComponent,
    data: {
      title: 'M5: Cấu hình SLA Escalation',
      resource: 'Setting',
      action: 'view'
    }
  },
  {
    path: 'auto-assignment',
    component: OperationSettingsComponent,
    data: {
      title: 'M5: Quy tắc chia Task tự động',
      resource: 'Setting',
      action: 'view'
    }
  },
  {
    path: 'inbound-channels',
    component: OperationSettingsComponent,
    data: {
      title: 'M5: Kênh tiếp nhận Webhook & API',
      resource: 'Setting',
      action: 'view'
    }
  },
  {
    path: 'notification-templates',
    component: OperationSettingsComponent,
    data: {
      title: 'M5: Mẫu tin thông báo (Zalo / SMS / Email)',
      resource: 'Setting',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationSettingsRoutingModule { }
