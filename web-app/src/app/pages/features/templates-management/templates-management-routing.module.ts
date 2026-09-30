import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesManagementComponent } from './templates-management.component';

const routes: Routes = [
  {
    path: '',
    component: TemplatesManagementComponent,
    data: {
      title: 'M1: Danh sách Quy trình & Vòng đời',
      resource: 'Template',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesManagementRoutingModule { }
