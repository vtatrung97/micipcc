import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsDashboardComponent } from './reports-dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: ReportsDashboardComponent,
    data: {
      title: 'M4: Dashboard SLA & Báo cáo Tổng thể',
      resource: 'Report',
      action: 'view'
    }
  },
  {
    path: 'sla-process',
    component: ReportsDashboardComponent,
    data: {
      title: 'M4: Báo cáo chi tiết SLA theo Quy trình',
      resource: 'Report',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsDashboardRoutingModule { }
