import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { InstanceHistoryComponent } from './instance-history.component';
import { InstanceHistoryRoutingModule } from './instance-history-routing.module';
import { InstanceAuditDrawerComponent } from './components/instance-audit-drawer/instance-audit-drawer.component';

@NgModule({
  declarations: [
    InstanceHistoryComponent,
    InstanceAuditDrawerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    InstanceHistoryRoutingModule
  ],
  exports: [
    InstanceHistoryComponent,
    InstanceAuditDrawerComponent
  ]
})
export class InstanceHistoryModule { }

