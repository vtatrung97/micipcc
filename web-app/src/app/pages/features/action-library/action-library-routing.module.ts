import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionLibraryComponent } from './action-library.component';

const routes: Routes = [
  {
    path: '',
    component: ActionLibraryComponent,
    data: {
      title: 'M1: Thư viện Action dùng chung (US-34)',
      resource: 'ActionLibrary',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionLibraryRoutingModule { }
