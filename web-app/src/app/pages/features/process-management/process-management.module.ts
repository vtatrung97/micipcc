import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ProcessManagementComponent } from './process-management.component';
import { ProcessManagementRoutingModule } from './process-management-routing.module';

@NgModule({
  declarations: [
    ProcessManagementComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ProcessManagementRoutingModule
  ],
  exports: []
})
export class ProcessManagementModule { }
