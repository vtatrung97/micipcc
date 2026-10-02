import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstanceHistoryComponent } from './instance-history.component';

const routes: Routes = [
  {
    path: '',
    component: InstanceHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstanceHistoryRoutingModule { }
