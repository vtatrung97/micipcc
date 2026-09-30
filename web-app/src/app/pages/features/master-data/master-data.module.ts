import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MasterDataComponent } from './master-data.component';
import { MasterDataRoutingModule } from './master-data-routing.module';

@NgModule({
  declarations: [
    MasterDataComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MasterDataRoutingModule
  ],
  exports: [
    MasterDataComponent
  ]
})
export class MasterDataModule { }
