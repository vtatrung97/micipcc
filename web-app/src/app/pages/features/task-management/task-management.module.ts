import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TaskManagementComponent } from './task-management.component';
import { TaskManagementRoutingModule } from './task-management-routing.module';

@NgModule({
  declarations: [
    TaskManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TaskManagementRoutingModule
  ],
  exports: [
    TaskManagementComponent
  ]
})
export class TaskManagementModule { }
