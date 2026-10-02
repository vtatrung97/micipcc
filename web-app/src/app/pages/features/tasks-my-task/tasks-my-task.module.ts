import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TasksMyTaskComponent } from './tasks-my-task.component';
import { TasksMyTaskRoutingModule } from './tasks-my-task-routing.module';

@NgModule({
  declarations: [
    TasksMyTaskComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TasksMyTaskRoutingModule
  ],
  exports: [
    TasksMyTaskComponent
  ]
})
export class TasksMyTaskModule { }
