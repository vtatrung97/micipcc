import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcessManagementRoutingModule } from './process-management-routing.module';
import { ProcessManagementComponent } from './process-management.component';

@NgModule({
  declarations: [
    ProcessManagementComponent
  ],
  imports: [
    CommonModule,
    ProcessManagementRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProcessManagementModule { }
