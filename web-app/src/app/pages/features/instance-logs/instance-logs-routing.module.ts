import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstanceLogsComponent } from './instance-logs.component';

const routes: Routes = [
  {
    path: '',
    component: InstanceLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstanceLogsRoutingModule { }
