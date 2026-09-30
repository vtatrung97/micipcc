import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForbiddenComponent } from './forbidden.component';

const routes: Routes = [
  {
    path: '',
    component: ForbiddenComponent,
    data: { title: '403 - Quyền truy cập bị từ chối' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForbiddenRoutingModule { }
