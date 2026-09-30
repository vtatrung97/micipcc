import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaBadgeComponent } from './components/sla-badge.component';
import { BreadcrumbsComponent } from './components/breadcrumbs.component';
import { SlaStatusPipe } from './pipes/sla-status.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [
    SlaBadgeComponent,
    BreadcrumbsComponent,
    SlaStatusPipe,
    DateFormatPipe,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    SlaBadgeComponent,
    BreadcrumbsComponent,
    SlaStatusPipe,
    DateFormatPipe,
    SafeHtmlPipe
  ]
})
export class SharedModule { }
