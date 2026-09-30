import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemAdminComponent } from './system-admin.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'organization',
    pathMatch: 'full'
  },
  {
    path: 'organization',
    component: SystemAdminComponent,
    data: {
      title: 'M7: Cơ cấu tổ chức & Phòng ban',
      resource: 'Admin',
      action: 'view'
    }
  },
  {
    path: 'users',
    component: SystemAdminComponent,
    data: {
      title: 'M7: Quản trị Người dùng',
      resource: 'Admin',
      action: 'view'
    }
  },
  {
    path: 'roles-permissions',
    component: SystemAdminComponent,
    data: {
      title: 'M7: Phân vai & Ma trận quyền RBAC',
      resource: 'Admin',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemAdminRoutingModule { }
