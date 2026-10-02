import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdminOrganizationComponent } from './admin-organization.component';
import { AdminOrganizationRoutingModule } from './admin-organization-routing.module';

@NgModule({
  declarations: [
    AdminOrganizationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminOrganizationRoutingModule
  ],
  exports: [
    AdminOrganizationComponent
  ]
})
export class AdminOrganizationModule { }
