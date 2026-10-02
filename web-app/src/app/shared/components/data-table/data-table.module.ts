import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerModule } from '../loading-spinner/loading-spinner.module';
import { EmptyStateModule } from '../empty-state/empty-state.module';
import { PaginationModule } from '../pagination/pagination.module';
import { DataTableComponent } from './data-table.component';

@NgModule({
  declarations: [DataTableComponent],
  imports: [CommonModule, LoadingSpinnerModule, EmptyStateModule, PaginationModule],
  exports: [DataTableComponent]
})
export class DataTableModule {}
