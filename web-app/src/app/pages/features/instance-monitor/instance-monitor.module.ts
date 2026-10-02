import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { InstanceMonitorComponent } from './instance-monitor.component';
import { InstanceMonitorRoutingModule } from './instance-monitor-routing.module';
import { InstanceTimelineDrawerComponent } from './components/instance-timeline-drawer/instance-timeline-drawer.component';

@NgModule({
  declarations: [
    InstanceMonitorComponent,
    InstanceTimelineDrawerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    InstanceMonitorRoutingModule
  ],
  exports: [
    InstanceMonitorComponent,
    InstanceTimelineDrawerComponent
  ]
})
export class InstanceMonitorModule { }

