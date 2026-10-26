import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessManagementComponent } from './process-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessManagementComponent
  },
  {
    path: '**',
    component: ProcessManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessManagementRoutingModule { }
