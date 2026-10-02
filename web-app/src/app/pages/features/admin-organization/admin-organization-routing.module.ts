import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminOrganizationComponent } from './admin-organization.component';

const routes: Routes = [
  {
    path: '',
    component: AdminOrganizationComponent,
    data: {
      title: 'M7: Cơ cấu tổ chức & Phòng ban',
      resource: 'Admin',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminOrganizationRoutingModule { }
