import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { TemplatesManagementComponent } from './templates-management.component';
import { TemplatesManagementRoutingModule } from './templates-management-routing.module';

@NgModule({
  declarations: [
    TemplatesManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TemplatesManagementRoutingModule
  ],
  exports: [
    TemplatesManagementComponent
  ]
})
export class TemplatesManagementModule { }
