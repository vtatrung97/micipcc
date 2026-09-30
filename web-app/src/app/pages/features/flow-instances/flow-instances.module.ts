import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FlowInstancesComponent } from './flow-instances.component';
import { FlowInstancesRoutingModule } from './flow-instances-routing.module';

@NgModule({
  declarations: [
    FlowInstancesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FlowInstancesRoutingModule
  ],
  exports: [
    FlowInstancesComponent
  ]
})
export class FlowInstancesModule { }
