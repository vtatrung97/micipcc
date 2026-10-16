import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessManagementComponent } from './process-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessManagementComponent,
    data: {
      title: 'M2',
      resource: '',
      action: ''
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessManagementRoutingModule { }
