import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterDataSubscribersComponent } from './master-data-subscribers.component';

const routes: Routes = [
  {
    path: '',
    component: MasterDataSubscribersComponent,
    data: {
      title: 'M6: Tra cứu thông tin thuê bao',
      resource: 'MasterData',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataSubscribersRoutingModule { }
