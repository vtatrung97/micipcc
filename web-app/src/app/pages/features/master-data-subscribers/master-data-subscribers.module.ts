import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MasterDataSubscribersComponent } from './master-data-subscribers.component';
import { MasterDataSubscribersRoutingModule } from './master-data-subscribers-routing.module';

@NgModule({
  declarations: [
    MasterDataSubscribersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MasterDataSubscribersRoutingModule
  ],
  exports: [
    MasterDataSubscribersComponent
  ]
})
export class MasterDataSubscribersModule { }
