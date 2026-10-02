import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdminRolesPermissionsRoutingModule } from './admin-roles-permissions-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    AdminRolesPermissionsRoutingModule
  ]
})
export class AdminRolesPermissionsModule { }
