import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TasksProcessRoutingModule } from './tasks-process-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    TasksProcessRoutingModule
  ]
})
export class TasksProcessModule { }
