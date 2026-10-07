import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 1. Nhóm Core & Icons
import { AntIconModule } from './components/ant-icon/ant-icon.module';
import { BreadcrumbsModule } from './components/breadcrumbs/breadcrumbs.module';
import { SlaBadgeModule } from './components/sla-badge/sla-badge.module';

// 2. Nhóm Form & Input Controls
import { AntInputModule } from './components/ant-input/ant-input.module';
import { AntSelectModule } from './components/ant-select/ant-select.module';
import { DatePickerModule } from './components/date-picker/date-picker.module';
import { MonthDayPickerModule } from './components/month-day-picker/month-day-picker.module';
import { AntTextareaModule } from './components/ant-textarea/ant-textarea.module';
import { MultiSelectModule } from './components/multi-select/multi-select.module';
import { QuickFilterModule } from './components/quick-filter/quick-filter.module';
import { DrawerModule } from './components/drawer/drawer.module';
import { AntCheckboxModule } from './components/ant-checkbox/ant-checkbox.module';
import { FormFieldModule } from './components/form-field/form-field.module';

// 3. Nhóm Bảng dữ liệu & Hiển thị
import { DataTableModule } from './components/data-table/data-table.module';
import { PaginationModule } from './components/pagination/pagination.module';
import { StatusTagModule } from './components/status-tag/status-tag.module';

// 4. Nhóm Phản hồi & Tương tác
import { ConfirmDialogModule } from './components/confirm-dialog/confirm-dialog.module';
import { EmptyStateModule } from './components/empty-state/empty-state.module';
import { LoadingSpinnerModule } from './components/loading-spinner/loading-spinner.module';

// Pipes
import { SlaStatusPipe } from './pipes/sla-status.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

const SHARED_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  
  // 19 Shared Component Modules
  AntIconModule,
  BreadcrumbsModule,
  SlaBadgeModule,
  AntInputModule,
  AntSelectModule,
  DatePickerModule,
  MonthDayPickerModule,
  AntTextareaModule,
  MultiSelectModule,
  QuickFilterModule,
  DrawerModule,
  AntCheckboxModule,
  FormFieldModule,
  DataTableModule,
  PaginationModule,
  StatusTagModule,
  ConfirmDialogModule,
  EmptyStateModule,
  LoadingSpinnerModule
];

const SHARED_PIPES = [
  SlaStatusPipe,
  DateFormatPipe,
  SafeHtmlPipe
];

@NgModule({
  declarations: [
    ...SHARED_PIPES
  ],
  imports: [
    ...SHARED_MODULES
  ],
  exports: [
    ...SHARED_MODULES,
    ...SHARED_PIPES
  ]
})
export class SharedModule { }
