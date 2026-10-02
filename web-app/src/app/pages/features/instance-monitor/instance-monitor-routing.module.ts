import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstanceMonitorComponent } from './instance-monitor.component';

const routes: Routes = [
  {
    path: '',
    component: InstanceMonitorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstanceMonitorRoutingModule { }
