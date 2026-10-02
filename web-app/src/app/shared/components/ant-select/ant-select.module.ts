import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { AntSelectComponent } from './ant-select.component';

@NgModule({
  declarations: [AntSelectComponent],
  imports: [CommonModule, FormsModule, AntIconModule],
  exports: [AntSelectComponent]
})
export class AntSelectModule {}
