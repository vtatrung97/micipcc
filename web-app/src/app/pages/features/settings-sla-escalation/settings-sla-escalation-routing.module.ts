import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsSlaEscalationComponent } from './settings-sla-escalation.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsSlaEscalationComponent,
    data: {
      title: 'M5: Cấu hình SLA Escalation',
      resource: 'Integration',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsSlaEscalationRoutingModule { }
