import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlowInstancesComponent } from './flow-instances.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'monitor',
    pathMatch: 'full'
  },
  {
    path: 'monitor',
    component: FlowInstancesComponent,
    data: {
      title: 'M2: Giám sát tiến trình thời gian thực',
      resource: 'Instance',
      action: 'view'
    }
  },
  {
    path: 'history',
    component: FlowInstancesComponent,
    data: {
      title: 'M2: Lịch sử thực thi & Audit (US-23)',
      resource: 'Instance',
      action: 'view'
    }
  },
  {
    path: 'logs',
    component: FlowInstancesComponent,
    data: {
      title: 'M2: Nhật ký Log hệ thống (FR-15)',
      resource: 'Instance',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowInstancesRoutingModule { }
