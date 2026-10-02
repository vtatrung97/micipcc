import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessTemplatesListComponent } from './process-templates-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessTemplatesListComponent,
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
export class ProcessTemplatesListRoutingModule { }
