import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcedureManagementRoutingModule } from './procedure-management-routing.module';
import { ProcedureManagementComponent } from './procedure-management.component';

@NgModule({
  declarations: [
    ProcedureManagementComponent
  ],
  imports: [
    CommonModule,
    ProcedureManagementRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProcedureManagementModule { }
