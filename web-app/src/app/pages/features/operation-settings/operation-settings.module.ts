import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { OperationSettingsComponent } from './operation-settings.component';
import { OperationSettingsRoutingModule } from './operation-settings-routing.module';

@NgModule({
  declarations: [
    OperationSettingsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OperationSettingsRoutingModule
  ],
  exports: [
    OperationSettingsComponent
  ]
})
export class OperationSettingsModule { }
