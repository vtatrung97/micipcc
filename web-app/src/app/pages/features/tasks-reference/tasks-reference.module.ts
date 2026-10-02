import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TasksReferenceRoutingModule } from './tasks-reference-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    TasksReferenceRoutingModule
  ]
})
export class TasksReferenceModule { }
