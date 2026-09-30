import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterDataComponent } from './master-data.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'subscribers',
    pathMatch: 'full'
  },
  {
    path: 'subscribers',
    component: MasterDataComponent,
    data: {
      title: 'M6: Tra cứu danh bạ thuê bao',
      resource: 'MasterData',
      action: 'view'
    }
  },
  {
    path: 'products-services',
    component: MasterDataComponent,
    data: {
      title: 'M6: Danh mục sản phẩm & dịch vụ',
      resource: 'MasterData',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
