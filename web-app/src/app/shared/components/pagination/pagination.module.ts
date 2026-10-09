import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AntSelectModule } from '../ant-select/ant-select.module';
import { PaginationComponent } from './pagination.component';

@NgModule({
  declarations: [PaginationComponent],
  imports: [CommonModule, FormsModule, AntSelectModule],
  exports: [PaginationComponent]
})
export class PaginationModule {}
