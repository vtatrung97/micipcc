import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { InstanceLogsComponent } from './instance-logs.component';
import { InstanceLogsRoutingModule } from './instance-logs-routing.module';
import { LogDetailModalComponent } from './components/log-detail-modal/log-detail-modal.component';

@NgModule({
  declarations: [
    InstanceLogsComponent,
    LogDetailModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    InstanceLogsRoutingModule
  ],
  exports: [
    InstanceLogsComponent,
    LogDetailModalComponent
  ]
})
export class InstanceLogsModule { }

