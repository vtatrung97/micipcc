import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ReportsDashboardComponent } from './reports-dashboard.component';
import { ReportsDashboardRoutingModule } from './reports-dashboard-routing.module';

@NgModule({
  declarations: [
    ReportsDashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportsDashboardRoutingModule
  ],
  exports: [
    ReportsDashboardComponent
  ]
})
export class ReportsDashboardModule { }
