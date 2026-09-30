import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { SystemAdminComponent } from './system-admin.component';
import { SystemAdminRoutingModule } from './system-admin-routing.module';

@NgModule({
  declarations: [
    SystemAdminComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SystemAdminRoutingModule
  ],
  exports: [
    SystemAdminComponent
  ]
})
export class SystemAdminModule { }
