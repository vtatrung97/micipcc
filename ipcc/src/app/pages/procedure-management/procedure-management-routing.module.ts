import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcedureManagementComponent } from './procedure-management.component';

const routes: Routes = [
  {
    path: '',
    component: ProcedureManagementComponent
  },
  {
    path: '**',
    component: ProcedureManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcedureManagementRoutingModule { }
