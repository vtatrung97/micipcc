import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AdminUsersRoutingModule } from './admin-users-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    AdminUsersRoutingModule
  ]
})
export class AdminUsersModule { }
