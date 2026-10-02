import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { SettingsSlaEscalationComponent } from './settings-sla-escalation.component';
import { SettingsSlaEscalationRoutingModule } from './settings-sla-escalation-routing.module';

@NgModule({
  declarations: [
    SettingsSlaEscalationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsSlaEscalationRoutingModule
  ],
  exports: [
    SettingsSlaEscalationComponent
  ]
})
export class SettingsSlaEscalationModule { }
